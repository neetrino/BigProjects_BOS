import { clsx } from 'clsx';

type StatusTone = 'draft' | 'active' | 'closed' | 'disabled' | 'neutral';

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

const TONE_CLASS: Record<StatusTone, string> = {
  draft: 'bg-zinc-100 text-zinc-700',
  active: 'bg-emerald-50 text-emerald-800',
  closed: 'bg-slate-100 text-slate-600',
  disabled: 'bg-red-50 text-red-700',
  neutral: 'bg-[var(--color-bg)] text-[var(--color-muted)]',
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
