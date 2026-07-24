import type { ReactNode } from 'react';

type PageStateProps = {
  message: string;
};

type EmptyStateProps = PageStateProps & {
  action?: ReactNode;
};

export function LoadingState({ message }: PageStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 py-10">
      <div className="h-1.5 w-24 animate-pulse rounded-full bg-[var(--color-accent-soft)]" />
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
    </div>
  );
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[var(--radius-panel)] border border-dashed border-[var(--color-border)] bg-white/50 px-6 py-10">
      <p className="max-w-md text-sm leading-relaxed text-[var(--color-muted)]">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message }: PageStateProps) {
  return (
    <p
      role="alert"
      className="rounded-[var(--radius-control)] border border-red-200 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]"
    >
      {message}
    </p>
  );
}
