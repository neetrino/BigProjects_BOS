import { clsx } from 'clsx';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { FIELD_CONTROL_CLASS } from '@/components/ui/field-control';

export { SelectInput } from '@/components/ui/select-input';
export { SearchInput } from '@/components/ui/search-input';
export { DateInput } from '@/components/ui/date-input';

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

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(FIELD_CONTROL_CLASS, props.className)} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(FIELD_CONTROL_CLASS, props.className)} {...props} />;
}
