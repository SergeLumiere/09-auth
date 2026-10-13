import { cookies } from 'next/headers';
import type { Note } from '@/types/note';
import { api } from './api';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';

const PER_PAGE = 12;

export async function fetchNotes({
  page,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const cookieStore = await cookies();

  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage: PER_PAGE,
      search,
      tag,
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${noteId}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}
