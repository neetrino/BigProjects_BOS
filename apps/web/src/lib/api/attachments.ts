import { apiFetch } from './client';
import type {
  AttachmentDownloadResponse,
  AttachmentItem,
  ConfirmAttachmentInput,
  ContentOwnerType,
  PresignAttachmentInput,
  PresignAttachmentResponse,
} from './types';

const ATTACHMENTS_BASE = '/api/v1/attachments';

export async function listAttachments(
  ownerType: ContentOwnerType,
  ownerId: string,
): Promise<AttachmentItem[]> {
  const params = new URLSearchParams({ ownerType, ownerId });
  return apiFetch<AttachmentItem[]>(`${ATTACHMENTS_BASE}?${params.toString()}`);
}

export async function presignAttachment(
  input: PresignAttachmentInput,
): Promise<PresignAttachmentResponse> {
  return apiFetch<PresignAttachmentResponse>(`${ATTACHMENTS_BASE}/presign`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function confirmAttachment(input: ConfirmAttachmentInput): Promise<AttachmentItem> {
  return apiFetch<AttachmentItem>(ATTACHMENTS_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getAttachmentDownloadUrl(id: string): Promise<AttachmentDownloadResponse> {
  return apiFetch<AttachmentDownloadResponse>(`${ATTACHMENTS_BASE}/${id}/download`);
}

export async function deleteAttachment(id: string): Promise<void> {
  await apiFetch<void>(`${ATTACHMENTS_BASE}/${id}`, {
    method: 'DELETE',
  });
}

/** Upload bytes to a presigned URL without cookies. */
export async function putPresignedFile(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
