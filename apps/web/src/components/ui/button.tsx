import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50',
  secondary:
    'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[var(--color-bg)] disabled:opacity-50',
  ghost:
    'border-transparent bg-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)] disabled:opacity-50',
  danger: 'border-transparent bg-red-700 text-white hover:bg-red-800 disabled:opacity-50',
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
        'inline-flex items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-sm font-medium transition-colors',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
