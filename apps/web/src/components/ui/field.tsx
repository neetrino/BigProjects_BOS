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
        className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]"
      >
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}

const CONTROL_CLASS =
  'w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white/95 px-3.5 py-2.5 text-sm text-[var(--color-fg)] shadow-sm outline-none transition-all duration-200 placeholder:text-[var(--color-muted)]/65 hover:border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-soft)]';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}
