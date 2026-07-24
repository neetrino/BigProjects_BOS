import type { ReactNode } from 'react';

type PageStateProps = {
  message: string;
};

type EmptyStateProps = PageStateProps & {
  action?: ReactNode;
};

export function LoadingState({ message }: PageStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-[soft-pulse_1.2s_ease-in-out_infinite] rounded-full bg-[var(--color-accent)]" />
        <span className="h-2 w-2 animate-[soft-pulse_1.2s_ease-in-out_0.2s_infinite] rounded-full bg-[var(--color-accent-mid)]" />
        <span className="h-2 w-2 animate-[soft-pulse_1.2s_ease-in-out_0.4s_infinite] rounded-full bg-[var(--color-brass)]" />
      </div>
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
    </div>
  );
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[var(--radius-panel)] border border-dashed border-[var(--color-border-strong)] bg-white/45 px-7 py-12 backdrop-blur-sm">
      <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[var(--color-brass)] to-[var(--color-accent-soft)]" />
      <p className="max-w-md text-sm leading-relaxed text-[var(--color-muted)]">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message }: PageStateProps) {
  return (
    <p
      role="alert"
      className="rounded-[var(--radius-control)] border border-red-200 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)] shadow-sm"
    >
      {message}
    </p>
  );
}
