import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[var(--color-accent)] text-white shadow-sm hover:bg-[var(--color-accent-hover)] disabled:opacity-50',
  secondary:
    'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg)] disabled:opacity-50',
  ghost:
    'border-transparent bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/60 hover:text-[var(--color-fg)] disabled:opacity-50',
  danger:
    'border-transparent bg-[var(--color-danger)] text-white shadow-sm hover:opacity-90 disabled:opacity-50',
};

export function Button({
  variant = 'secondary',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3.5 py-2 text-sm font-semibold tracking-tight transition-all duration-150',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
