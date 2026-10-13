import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';

const PER_PAGE = 12;

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface FetchNotesParams {
  page: number;
  search?: string;
  tag?: string;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function fetchNotes({
  page,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage: PER_PAGE,
      search,
      tag,
    },
  });

  return response.data;
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${noteId}`);

  return response.data;
}

export async function createNote(noteData: CreateNoteParams): Promise<Note> {
  const response = await api.post<Note>('/notes', noteData);

  return response.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${noteId}`);

  return response.data;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export async function register(credentials: RegisterRequest): Promise<User> {
  const response = await api.post<User>('/auth/register', credentials);

  return response.data;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(credentials: LoginRequest): Promise<User> {
  const response = await api.post<User>('/auth/login', credentials);

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

interface CheckSessionResponse {
  success: boolean;
}

export async function checkSession(): Promise<boolean> {
  const response = await api.get<CheckSessionResponse>('/auth/session');

  return response.data.success;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>('/users/me');

  return response.data;
}

export interface UpdateMeRequest {
  username: string;
}

export async function updateMe(userData: UpdateMeRequest): Promise<User> {
  const response = await api.patch<User>('/users/me', userData);

  return response.data;
}
