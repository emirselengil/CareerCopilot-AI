"""PDF/DOCX metin çıkarımı (TASK-107).

PyMuPDF (fitz) ile PDF, python-docx ile DOCX okunur.
"""
from __future__ import annotations

import os
import time
import uuid

import fitz  # PyMuPDF
from docx import Document as DocxDocument

from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_FILE_VISIBILITY_RETRY_ATTEMPTS = 5
_FILE_VISIBILITY_RETRY_DELAY_SECONDS = 0.4


def build_upload_path(user_id: uuid.UUID, filename: str) -> str:
    user_dir = os.path.join(settings.upload_dir, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    safe_name = f"{uuid.uuid4().hex}_{os.path.basename(filename)}"
    return os.path.join(user_dir, safe_name)


def save_upload_bytes(path: str, content: bytes) -> None:
    with open(path, "wb") as f:
        f.write(content)


def delete_upload_file(file_path: str | None) -> None:
    """Diskteki yüklenmiş dosyayı siler (TASK: DELETE /documents/{doc_id}).

    Dosya yolu `None` ise veya dosya diskte yoksa sessizce geçer; hata fırlatmaz.
    """
    if not file_path:
        return
    try:
        os.remove(file_path)
    except FileNotFoundError:
        return
    except OSError:
        logger.exception("Belge dosyası silinirken hata oluştu: %s", file_path)


def extract_text_from_pdf(file_path: str) -> str:
    text_parts: list[str] = []
    with fitz.open(file_path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n\n".join(text_parts).strip()


def extract_text_from_docx(file_path: str) -> str:
    doc = DocxDocument(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs).strip()


def _wait_until_visible(file_path: str) -> None:
    """Celery worker ve backend farklı container'lar olduğu için, yükleme
    sonrası dosya paylaşımlı Docker volume'ünde anlık olarak görünmeyebilir
    (özellikle Windows/Docker Desktop'ta gözlemlenen bir gecikme). Gerçekten
    eksik bir dosyayı sessizce boş metne çevirmek yerine kısa bir retry ile
    bu geçici durumu tolere edip, hâlâ yoksa net bir hata fırlatıyoruz.
    """
    for _ in range(_FILE_VISIBILITY_RETRY_ATTEMPTS):
        if os.path.exists(file_path):
            return
        time.sleep(_FILE_VISIBILITY_RETRY_DELAY_SECONDS)
    raise FileNotFoundError(file_path)


def extract_raw_text(file_path: str) -> str:
    lowered = file_path.lower()
    _wait_until_visible(file_path)
    try:
        if lowered.endswith(".pdf"):
            return extract_text_from_pdf(file_path)
        if lowered.endswith(".docx") or lowered.endswith(".doc"):
            return extract_text_from_docx(file_path)
    except Exception:  # noqa: BLE001
        logger.exception("Belge metni çıkarılırken hata oluştu: %s", file_path)
        return ""
    return ""


def mock_parsed_skills() -> dict:
    """Sprint 2'de CV Agent tarafından gerçek değerlerle doldurulacak mock yapı."""
    return {"languages": [], "frameworks": [], "tools": [], "experience": [], "education": []}
