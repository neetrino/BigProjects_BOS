import { apiFetch } from './client';
import type { ContentOwnerType, CreateNoteInput, NoteItem } from './types';

const NOTES_BASE = '/api/v1/notes';

export async function listNotes(ownerType: ContentOwnerType, ownerId: string): Promise<NoteItem[]> {
  const params = new URLSearchParams({ ownerType, ownerId });
  return apiFetch<NoteItem[]>(`${NOTES_BASE}?${params.toString()}`);
}

export async function createNote(input: CreateNoteInput): Promise<NoteItem> {
  return apiFetch<NoteItem>(NOTES_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await apiFetch<void>(`${NOTES_BASE}/${id}`, {
    method: 'DELETE',
  });
}
