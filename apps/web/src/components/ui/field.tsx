import { clsx } from 'clsx';
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

export { SelectInput } from '@/components/ui/select-input';
export { SearchInput } from '@/components/ui/search-input';

type FieldProps = {
  label: ReactNode;
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)]"
      >
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}

const CONTROL_CLASS =
  'w-full rounded-xl border border-[var(--color-border)] bg-[#f3f2ee] px-3.5 py-2.5 text-sm font-medium text-[var(--color-fg)] outline-none transition-colors duration-150 placeholder:font-medium placeholder:text-[var(--color-muted)]/60 hover:border-[var(--color-border-strong)] focus:border-[var(--color-brand)] focus:bg-white';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(CONTROL_CLASS, props.className)} {...props} />;
}
