'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { createUser } from '@/lib/api/users';
import type { UserAccount, UserRole } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Field, SelectInput, TextInput } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';

type CreateUserSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: UserAccount) => void;
};

export function CreateUserSheet({ open, onClose, onCreated }: CreateUserSheetProps) {
  if (!open) {
    return null;
  }

  return <CreateUserSheetInner onClose={onClose} onCreated={onCreated} />;
}

type CreateUserSheetInnerProps = {
  onClose: () => void;
  onCreated: (user: UserAccount) => void;
};

function CreateUserSheetInner({ onClose, onCreated }: CreateUserSheetInnerProps) {
  const t = useTranslations('settings.staff');
  const tCommon = useTranslations('common');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tCommon('unexpectedError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open
      title={t('createTitle')}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" form="create-user-form" variant="primary" disabled={busy}>
            {busy ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label={t('fields.name')} htmlFor="user-name">
          <TextInput
            id="user-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label={t('fields.email')} htmlFor="user-email">
          <TextInput
            id="user-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label={t('fields.password')} htmlFor="user-password">
          <TextInput
            id="user-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Field label={t('fields.role')} htmlFor="user-role">
          <SelectInput
            id="user-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
          >
            <option value="STAFF">{t('roles.STAFF')}</option>
            <option value="ADMIN">{t('roles.ADMIN')}</option>
          </SelectInput>
        </Field>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>
    </Sheet>
  );
}
