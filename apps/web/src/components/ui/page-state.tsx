import type { ReactNode } from 'react';

type PageStateProps = {
  message: string;
};

type EmptyStateProps = PageStateProps & {
  action?: ReactNode;
};

export function LoadingState({ message }: PageStateProps) {
  return <p className="py-8 text-sm text-[var(--color-muted)]">{message}</p>;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message }: PageStateProps) {
  return (
    <p role="alert" className="py-8 text-sm text-red-700">
      {message}
    </p>
  );
}
