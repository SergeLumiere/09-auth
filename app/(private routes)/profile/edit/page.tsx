'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useState } from 'react';
import type { User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateMe } from '@/lib/api/clientApi';
import css from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <main>Loading profile...</main>;
  }

  return <EditProfileForm user={user} />;
}

function EditProfileForm({ user }: { user: User }) {
  const [username, setUsername] = useState(user.username);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updatedUser = await updateMe({ username });

      setUser(updatedUser);
      router.push('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={user.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.push('/profile')}
            >
              Cancel
            </button>
          </div>

          {errorMessage && <p role="alert">{errorMessage}</p>}
        </form>
      </div>
    </main>
  );
}
