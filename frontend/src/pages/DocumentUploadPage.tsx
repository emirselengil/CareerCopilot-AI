import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteDocument, getLatestDocuments } from '@/api/documents';
import { getApiErrorMessage } from '@/api/client';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { tr } from '@/i18n/tr';
import type { DocumentSummary, DocumentType, LatestDocumentsResponse } from '@/types/document';

const documentTypeLabel: Record<DocumentType, string> = {
  cv: tr.documents.documentTypeCv,
  linkedin_pdf: tr.documents.documentTypeLinkedin,
  generated_cv: tr.documents.documentTypeGenerated,
};

interface UploadCardProps {
  documentType: DocumentType;
  title: string;
}

function UploadCard({ documentType, title }: UploadCardProps) {
  const { selectAndUpload, uploadMutation, statusQuery } = useDocumentUpload(documentType);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) selectAndUpload(file);
  }

  const status = statusQuery.data?.status;
  const isBusy = uploadMutation.isPending || (!!status && status !== 'completed' && status !== 'failed');

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-default">{title}</h2>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
            : 'border-border hover:border-primary-400'
        }`}
      >
        <p className="text-sm font-medium text-muted">{tr.documents.dropzoneHint}</p>
        <p className="mt-1 text-xs text-faint">{tr.documents.dropzoneFormats}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) selectAndUpload(file);
            e.target.value = '';
          }}
        />
      </div>

      {isBusy && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
            aria-hidden="true"
          />
          <span className="text-sm text-muted">
            {uploadMutation.isPending
              ? tr.documents.uploading
              : status === 'queued'
                ? tr.documents.queued
                : tr.documents.processing}
          </span>
        </div>
      )}

      {status === 'completed' && (
        <p className="mt-4 text-sm font-medium text-green-700 dark:text-green-400">
          {tr.documents.completed}
        </p>
      )}

      {status === 'failed' && (
        <p className="mt-4 text-sm font-medium text-red-700 dark:text-red-400">
          {statusQuery.data?.error_message ?? tr.documents.failed}
        </p>
      )}
    </div>
  );
}

interface DocumentCardProps {
  doc: DocumentSummary;
  onDelete: (docId: string) => void;
  isDeleting: boolean;
}

function DocumentCard({ doc, onDelete, isDeleting }: DocumentCardProps) {
  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
          {documentTypeLabel[doc.document_type]}
        </span>
        <div className="flex items-center gap-2">
          {doc.cv_score !== null && (
            <span className="text-sm font-semibold text-default">
              {tr.documents.cvScore}: {doc.cv_score}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(doc.document_id)}
            disabled={isDeleting}
            aria-label={tr.documents.deleteDocument}
            className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {isDeleting ? tr.documents.deleting : tr.documents.deleteDocument}
          </button>
        </div>
      </div>
      {doc.cv_score_explanation && (
        <p className="mt-2 text-sm text-muted">{doc.cv_score_explanation}</p>
      )}
      {(doc.parsed_skills?.languages?.length > 0 ||
        doc.parsed_skills?.frameworks?.length > 0 ||
        doc.parsed_skills?.tools?.length > 0) && (
        <div className="mt-3 space-y-1 text-sm text-muted">
          {doc.parsed_skills.languages?.length > 0 && (
            <p>
              <span className="font-medium text-default">{tr.documents.languages}:</span>{' '}
              {doc.parsed_skills.languages.join(', ')}
            </p>
          )}
          {doc.parsed_skills.frameworks?.length > 0 && (
            <p>
              <span className="font-medium text-default">{tr.documents.frameworks}:</span>{' '}
              {doc.parsed_skills.frameworks.join(', ')}
            </p>
          )}
          {doc.parsed_skills.tools?.length > 0 && (
            <p>
              <span className="font-medium text-default">{tr.documents.tools}:</span>{' '}
              {doc.parsed_skills.tools.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function DocumentUploadPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const latestDocsQuery = useQuery({
    queryKey: ['latestDocuments'],
    queryFn: getLatestDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteDocument(docId),
    onMutate: (docId) => {
      setDeletingId(docId);
    },
    onSuccess: (_data, docId) => {
      queryClient.setQueryData<LatestDocumentsResponse>(['latestDocuments'], (previous) =>
        previous
          ? { documents: previous.documents.filter((doc) => doc.document_id !== docId) }
          : previous,
      );
      toast.success(tr.documents.deleteSuccess);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || tr.documents.deleteError);
    },
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['latestDocuments'] });
    },
  });

  function handleDelete(docId: string) {
    const confirmed = window.confirm(tr.documents.deleteConfirm);
    if (!confirmed) return;
    deleteMutation.mutate(docId);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-default">{tr.documents.title}</h1>
        <p className="mt-1 text-sm text-faint">{tr.documents.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UploadCard documentType="cv" title={tr.documents.uploadCv} />
        <UploadCard documentType="linkedin_pdf" title={tr.documents.uploadLinkedin} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-default">{tr.documents.uploadedDocumentsTitle}</h2>
        {latestDocsQuery.isLoading && <Spinner label={tr.common.loading} />}
        {latestDocsQuery.data &&
          (() => {
            const visibleDocs = latestDocsQuery.data.documents.filter(
              (doc) => doc.document_type !== 'generated_cv',
            );
            if (visibleDocs.length === 0) {
              return <EmptyState title={tr.documents.noDocuments} />;
            }
            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visibleDocs.map((doc) => (
                  <DocumentCard
                    key={doc.document_id}
                    doc={doc}
                    onDelete={handleDelete}
                    isDeleting={deletingId === doc.document_id}
                  />
                ))}
              </div>
            );
          })()}
      </div>
    </div>
  );
}
