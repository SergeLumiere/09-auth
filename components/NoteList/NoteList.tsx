'use client';

import type { Note } from '@/types/note';
import css from './NoteList.module.css';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '@/lib/api/clientApi';

import Link from 'next/link';

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
    },
  });

  return (
    <>
      <ul className={css.list}>
        {notes.map(note => (
          <li className={css.listItem} key={note.id}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>

              <Link href={`/notes/${note.id}`}>View details</Link>

              <button
                type="button"
                className={css.button}
                onClick={() => deleteNoteMutation.mutate(note.id)}
                disabled={deleteNoteMutation.isPending}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deleteNoteMutation.isError && <p role="alert">Failed to delete note. Please try again.</p>}
    </>
  );
}
