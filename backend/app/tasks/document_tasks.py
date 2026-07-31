"""Belge analiz Celery task'ı (TASK-107, TASK-203).

Sprint 1: yalnızca raw_text çıkarımı + mock parsed_skills.
Sprint 2 (TASK-203): CV Agent ile gerçek parsed_skills + cv_score + embeddings.
"""
from __future__ import annotations

import asyncio
import uuid

from sqlalchemy import select

from app.core.constants import MSG_DOCUMENT_FILE_MISSING
from app.core.logging import get_logger
from app.db.session import async_session_maker, run_in_fresh_event_loop
from app.models.enums import DocumentType, ProcessingStatus
from app.models.uploaded_document import UploadedDocument
from app.services.document_service import extract_raw_text, mock_parsed_skills
from app.tasks.celery_app import celery_app

logger = get_logger(__name__)


async def _process_document(doc_id: str) -> None:
    async with async_session_maker() as db:
        result = await db.execute(select(UploadedDocument).where(UploadedDocument.id == uuid.UUID(doc_id)))
        document = result.scalar_one_or_none()
        if document is None:
            logger.warning("process_document_task: belge bulunamadı %s", doc_id)
            return

        document.status = ProcessingStatus.PROCESSING
        await db.commit()

        try:
            raw_text = extract_raw_text(document.file_path) if document.file_path else ""
            document.raw_text = raw_text

            # Sprint 2 (TASK-203): CV Agent ile gerçek yetkinlik çıkarımı ve skorlama.
            try:
                from app.agents.cv_agent import CVAgent

                agent_output = await CVAgent().analyze(
                    raw_text=raw_text,
                    document_type=document.document_type,
                )
                document.parsed_skills = agent_output.get("parsed_skills", mock_parsed_skills())
                if document.document_type == DocumentType.CV:
                    document.cv_score = agent_output.get("cv_score")
                    document.cv_score_explanation = agent_output.get("cv_score_explanation")

                # Chunk + embed + DocumentEmbedding insert (metadata.source_label=user_document)
                from app.services.rag_indexer import index_document_text

                await index_document_text(db, document)
            except Exception:  # noqa: BLE001
                logger.exception("CV Agent analiz adımı başarısız, mock veriyle devam ediliyor.")
                document.parsed_skills = mock_parsed_skills()

            document.status = ProcessingStatus.COMPLETED
            document.error_message = None
        except FileNotFoundError:
            logger.exception("Belge dosyası diskte bulunamadı: %s", doc_id)
            document.status = ProcessingStatus.FAILED
            document.error_message = MSG_DOCUMENT_FILE_MISSING
        except Exception as exc:  # noqa: BLE001
            logger.exception("Belge işlenirken hata oluştu: %s", doc_id)
            document.status = ProcessingStatus.FAILED
            document.error_message = str(exc)

        await db.commit()
        return document.status, document.error_message


@celery_app.task(name="app.tasks.document_tasks.process_document_task", bind=True)
def process_document_task(self, doc_id: str, user_id: str) -> dict:
    meta = {"resource_type": "document", "resource_id": doc_id, "user_id": user_id}
    self.update_state(state="PROCESSING", meta=meta)
    status, error_message = asyncio.run(run_in_fresh_event_loop(_process_document(doc_id)))
    return {**meta, "final_status": status.value, "error_message": error_message}
