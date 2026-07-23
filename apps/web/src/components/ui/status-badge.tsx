import { clsx } from 'clsx';
import { STAGE_BADGE_TONE_CLASS } from '@/lib/stage-colors';

type StatusTone =
  | 'draft'
  | 'active'
  | 'closed'
  | 'disabled'
  | 'neutral'
  | 'contacted'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'confirmed';

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

const TONE_CLASS: Record<StatusTone, string> = {
  draft: STAGE_BADGE_TONE_CLASS.draft ?? 'bg-zinc-100 text-zinc-700',
  active: 'bg-emerald-50 text-emerald-800',
  closed: 'bg-slate-100 text-slate-600',
  disabled: 'bg-red-50 text-red-700',
  neutral: 'bg-[var(--color-bg)] text-[var(--color-muted)]',
  contacted: STAGE_BADGE_TONE_CLASS.contacted ?? 'bg-sky-50 text-sky-800',
  negotiation: STAGE_BADGE_TONE_CLASS.negotiation ?? 'bg-amber-50 text-amber-900',
  won: STAGE_BADGE_TONE_CLASS.won ?? 'bg-emerald-100 text-emerald-900',
  lost: STAGE_BADGE_TONE_CLASS.lost ?? 'bg-rose-50 text-rose-800',
  confirmed: STAGE_BADGE_TONE_CLASS.confirmed ?? 'bg-violet-50 text-violet-800',
};

export type { StatusTone };

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
