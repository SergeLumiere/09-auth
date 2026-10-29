'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';
import { useNoteStore } from '@/lib/store/noteStore';
import type { NoteTag } from '@/types/note';
import { createNote } from '@/lib/api/clientApi';
import css from './NoteForm.module.css';

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useNoteStore(state => state.draft);
  const setDraft = useNoteStore(state => state.setDraft);
  const clearDraft = useNoteStore(state => state.clearDraft);

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
      router.push('/notes/filter/all');
    },
  });

  const handleSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const tag = formData.get('tag') as NoteTag;

    createNoteMutation.mutate({
      title,
      content,
      tag,
    });
  };

  return (
    <form action={handleSubmit} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          required
          minLength={3}
          maxLength={50}
          defaultValue={draft.title}
          onChange={event =>
            setDraft({
              ...draft,
              title: event.target.value,
            })
          }
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          maxLength={500}
          defaultValue={draft.content}
          onChange={event =>
            setDraft({
              ...draft,
              content: event.target.value,
            })
          }
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          key={draft.tag}
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={event =>
            setDraft({
              ...draft,
              tag: event.target.value as NoteTag,
            })
          }
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={createNoteMutation.isPending}>
          Create note
        </button>
      </div>
      {createNoteMutation.isError && <p role="alert">Failed to create note. Please try again.</p>}
    </form>
  );
}
