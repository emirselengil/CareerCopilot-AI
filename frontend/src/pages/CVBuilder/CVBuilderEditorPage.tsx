import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { downloadCvPdf, exportCVPdf, getCVDraft, previewCVPdf } from '@/api/cv';
import { getApiErrorMessage } from '@/api/client';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { tr } from '@/i18n/tr';

/**
 * CV taslağı canlı PDF önizlemesi (bkz. API_CONTRACT.md §4, TASK-231).
 * `status="generated"` (veya `"exported"`) olana kadar polling ile bekler;
 * ardından gerçek PDF export'unun birebir aynısı (`form_data.sections`'tan
 * üretilen yapılandırılmış CV) `/cv/draft/{id}/preview-pdf` üzerinden çekilip
 * neredeyse tüm ekranı kaplayan bir `<iframe>` içinde gösterilir — WYSIWYG
 * garantilidir çünkü aynı render pipeline'ı kullanılır. Uygulama yalnızca
 * Türkçe CV üretir (İngilizce desteği kaldırıldı).
 */
export function CVBuilderEditorPage() {
  const { draftId } = useParams<{ draftId: string }>();

  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const draftQuery = useQuery({
    queryKey: ['cvDraft', draftId],
    queryFn: () => getCVDraft(draftId as string),
    enabled: !!draftId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'generated' || status === 'exported' ? false : 2000;
    },
  });

  const draft = draftQuery.data;

  const previewQuery = useQuery({
    queryKey: ['cvDraftPreviewPdf', draftId],
    queryFn: () => previewCVPdf(draftId as string),
    enabled: !!draftId && !!draft && draft.status !== 'draft',
  });

  useEffect(() => {
    if (!previewQuery.data) return;
    const url = URL.createObjectURL(previewQuery.data);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewQuery.data]);

  async function handleDownloadPdf() {
    if (!draftId) return;
    setIsDownloading(true);
    try {
      const exportRes = await exportCVPdf({ draft_id: draftId, language: 'tr' });
      const blob = await downloadCvPdf(exportRes.download_url);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cv_${draftId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
      toast.success(tr.cvBuilder.editorDownloadSuccess);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || tr.cvBuilder.editorDownloadError);
    } finally {
      setIsDownloading(false);
    }
  }

  if (draftQuery.isLoading) {
    return <Spinner label={tr.common.loading} />;
  }

  if (draftQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(draftQuery.error)}
        onRetry={() => draftQuery.refetch()}
      />
    );
  }

  if (!draft || draft.status === 'draft') {
    return (
      <div className="mx-auto max-w-2xl">
        <Spinner label={tr.cvBuilder.editorGenerating} />
        <p className="text-center text-sm text-faint">{tr.cvBuilder.editorGeneratingHint}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-default">{tr.cvBuilder.editorTitle}</h1>
        <Button onClick={handleDownloadPdf} isLoading={isDownloading}>
          {isDownloading ? tr.cvBuilder.editorDownloading : tr.cvBuilder.editorDownloadPdf}
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        {previewQuery.isLoading ? (
          <Spinner label={tr.cvBuilder.editorPreviewLoading} />
        ) : previewQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(previewQuery.error) || tr.cvBuilder.editorPreviewLoadError}
            onRetry={() => previewQuery.refetch()}
          />
        ) : previewUrl ? (
          <iframe
            src={previewUrl}
            title={tr.cvBuilder.editorPreviewLabel}
            className="h-full w-full rounded-xl border border-border"
          />
        ) : null}
      </div>
    </div>
  );
}
