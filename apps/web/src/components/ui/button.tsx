import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'btn-primary-fill border-transparent text-white hover:brightness-[1.04] active:translate-y-px disabled:opacity-50',
  secondary:
    'border-[var(--color-border)] bg-white/90 text-[var(--color-fg)] shadow-sm hover:border-[var(--color-border-strong)] hover:bg-white hover:shadow-[var(--shadow-soft)] disabled:opacity-50',
  ghost:
    'border-transparent bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/70 hover:text-[var(--color-fg)] disabled:opacity-50',
  danger:
    'border-transparent bg-[var(--color-danger)] text-white shadow-sm hover:brightness-110 disabled:opacity-50',
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
        'inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3.5 py-2 text-sm font-semibold tracking-tight transition-all duration-200',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
