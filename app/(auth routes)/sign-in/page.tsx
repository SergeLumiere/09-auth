'use client';

import { login } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import css from './SignInPage.module.css';

export default function SignInPage() {
  const setUser = useAuthStore(state => state.setUser);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    if (isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      setUser(user);
      router.replace('/profile');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h1 className={css.formTitle}>Sign In</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className={css.input} required />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className={css.input} required />
        </div>

        {errorMessage && (
          <p className={css.error} role="alert">
            {errorMessage}
          </p>
        )}

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </main>
  );
}
