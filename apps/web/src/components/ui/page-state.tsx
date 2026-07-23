type PageStateProps = {
  message: string;
};

export function LoadingState({ message }: PageStateProps) {
  return <p className="py-8 text-sm text-[var(--color-muted)]">{message}</p>;
}

export function EmptyState({ message }: PageStateProps) {
  return <p className="py-8 text-sm text-[var(--color-muted)]">{message}</p>;
}

export function ErrorState({ message }: PageStateProps) {
  return (
    <p role="alert" className="py-8 text-sm text-red-700">
      {message}
    </p>
  );
}
