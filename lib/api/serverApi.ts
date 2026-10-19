import { cookies } from 'next/headers';
import type { Note } from '@/types/note';
import { api } from './api';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';
import type { User } from '@/types/user';

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

export async function getMe(): Promise<User> {
  const cookieStore = await cookies();

  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
}

interface CheckSessionResponse {
  success: boolean;
}

export async function checkSession(): Promise<boolean> {
  const cookieStore = await cookies();

  const response = await api.get<CheckSessionResponse>('/auth/session', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data.success;
}
