'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { login } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';

export function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login({ email: email.trim(), password });
      router.replace('/cycles');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError(t('tooManyAttempts'));
        } else if (err.status === 401) {
          setError(t('invalidCredentials'));
        } else {
          setError(err.message || t('genericError'));
        }
      } else {
        setError(t('genericError'));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Field label={t('email')} htmlFor="login-email">
        <TextInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field label={t('password')} htmlFor="login-password">
        <TextInput
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-control)] border border-red-200 bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={busy} className="mt-1 w-full py-2.5">
        {busy ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
