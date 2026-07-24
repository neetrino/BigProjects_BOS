import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onBrand';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'btn-primary-fill border-transparent text-white disabled:opacity-50',
  secondary:
    'border-transparent bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-mid)] disabled:opacity-50',
  ghost:
    'border-transparent bg-transparent text-[var(--color-brand)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-brand)] disabled:opacity-50',
  danger:
    'border-transparent bg-[var(--color-danger)] text-white hover:bg-[#9b1c14] disabled:opacity-50',
  onBrand:
    'border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15 disabled:opacity-50',
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
        'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-control)] border px-3.5 text-sm font-semibold tracking-tight outline-none transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
