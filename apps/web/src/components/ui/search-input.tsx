import { clsx } from 'clsx';
import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Toolbar / filter search field styled after ToonExpo marketplace inputs:
 * icon affordance, medium weight text, quiet border, no glow ring.
 */
export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className={clsx('relative min-w-0', className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]"
        aria-hidden
      />
      <input
        type="search"
        {...props}
        className={clsx(
          'w-full h-9 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white',
          'pl-10 pr-3.5 text-sm font-medium tracking-tight text-[var(--color-fg)]',
          'outline-none transition-colors duration-150',
          'placeholder:font-medium placeholder:text-[var(--color-muted)]/65',
          'hover:border-[var(--color-border-strong)]',
          'focus:border-[var(--color-brand)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&::-webkit-search-cancel-button]:appearance-none',
          '[&::-webkit-search-decoration]:appearance-none',
        )}
      />
    </div>
  );
}
