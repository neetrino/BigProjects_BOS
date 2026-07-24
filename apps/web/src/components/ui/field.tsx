import { clsx } from 'clsx';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide text-[var(--color-muted)]"
      >
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}

const CONTROL_CLASS =
  'w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] shadow-sm outline-none transition-colors placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}
