import { apiClient } from './client';
import type {
  CVDraft,
  CVDraftListResponse,
  ExportPdfRequest,
  ExportPdfResponse,
  GenerateCVRequest,
  GenerateCVResponse,
  UpdateCVDraftRequest,
} from '@/types/cv';

export async function generateCV(payload: GenerateCVRequest): Promise<GenerateCVResponse> {
  const { data } = await apiClient.post<GenerateCVResponse>('/cv/generate', payload);
  return data;
}

export async function getCVDraft(draftId: string): Promise<CVDraft> {
  const { data } = await apiClient.get<CVDraft>(`/cv/draft/${draftId}`);
  return data;
}

export async function updateCVDraft(
  draftId: string,
  payload: UpdateCVDraftRequest,
): Promise<CVDraft> {
  const { data } = await apiClient.patch<CVDraft>(`/cv/draft/${draftId}`, payload);
  return data;
}

export async function listCVDrafts(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<CVDraftListResponse> {
  const { data } = await apiClient.get<CVDraftListResponse>('/cv/drafts', { params });
  return data;
}

export async function exportCVPdf(payload: ExportPdfRequest): Promise<ExportPdfResponse> {
  const { data } = await apiClient.post<ExportPdfResponse>('/cv/export-pdf', payload);
  return data;
}

/**
 * CV Builder Editor'ün canlı PDF önizlemesi (kalıcı belge oluşturmaz).
 */
export async function previewCVPdf(draftId: string, language: 'tr' | 'en'): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/cv/draft/${draftId}/preview-pdf`, {
    params: { language },
    responseType: 'blob',
  });
  return data;
}

/**
 * `download_url` API_CONTRACT.md §4'e göre `/api/v1` önekiyle birlikte gelir
 * (`/api/v1/cv/download/{document_id}`); `apiClient`'ın `baseURL`'i de aynı
 * öneki içerdiğinden çakışmayı önlemek için önek burada temizlenir. İndirme,
 * Bearer token gerektirdiğinden düz `<a href>` yerine bu istemci üzerinden
 * blob olarak çekilir.
 */
export async function downloadCvPdf(downloadUrl: string): Promise<Blob> {
  const path = downloadUrl.replace(/^\/api\/v1/, '');
  const { data } = await apiClient.get<Blob>(path, { responseType: 'blob' });
  return data;
}
