'use client';

import type { FormEvent, ReactNode } from 'react';
import { Briefcase, Mail, Phone, User, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';

export type ContactDraft = {
  name: string;
  phone: string;
  email: string;
  position: string;
  isPrimary: boolean;
};

export const EMPTY_CONTACT_DRAFT: ContactDraft = {
  name: '',
  phone: '',
  email: '',
  position: '',
  isPrimary: false,
};

type ContactFormProps = {
  draft: ContactDraft;
  onChange: (draft: ContactDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  busy: boolean;
  submitLabel: string;
};

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <>
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      {children}
    </>
  );
}

export function ContactForm({
  draft,
  onChange,
  onSubmit,
  onCancel,
  busy,
  submitLabel,
}: ContactFormProps) {
  const t = useTranslations('organizations.contacts');
  const tCommon = useTranslations('common');

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <Field
        label={<FieldLabel icon={User}>{t('fields.name')}</FieldLabel>}
        htmlFor="contact-name"
      >
        <TextInput
          id="contact-name"
          required
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
        />
      </Field>
      <Field
        label={<FieldLabel icon={Phone}>{t('fields.phone')}</FieldLabel>}
        htmlFor="contact-phone"
      >
        <TextInput
          id="contact-phone"
          value={draft.phone}
          onChange={(event) => onChange({ ...draft, phone: event.target.value })}
        />
      </Field>
      <Field
        label={<FieldLabel icon={Mail}>{t('fields.email')}</FieldLabel>}
        htmlFor="contact-email"
      >
        <TextInput
          id="contact-email"
          type="email"
          value={draft.email}
          onChange={(event) => onChange({ ...draft, email: event.target.value })}
        />
      </Field>
      <Field
        label={<FieldLabel icon={Briefcase}>{t('fields.position')}</FieldLabel>}
        htmlFor="contact-position"
      >
        <TextInput
          id="contact-position"
          value={draft.position}
          onChange={(event) => onChange({ ...draft, position: event.target.value })}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <input
          type="checkbox"
          checked={draft.isPrimary}
          onChange={(event) => onChange({ ...draft, isPrimary: event.target.checked })}
        />
        {t('fields.isPrimary')}
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? tCommon('saving') : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {tCommon('cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
