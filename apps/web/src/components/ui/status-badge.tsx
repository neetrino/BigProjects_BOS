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
  draft: STAGE_BADGE_TONE_CLASS.draft ?? 'bg-slate-100 text-slate-700',
  active: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  closed: 'bg-slate-100 text-slate-600',
  disabled: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  neutral: 'bg-[var(--color-bg)] text-[var(--color-muted)]',
  contacted: STAGE_BADGE_TONE_CLASS.contacted ?? 'bg-sky-50 text-sky-800',
  negotiation: STAGE_BADGE_TONE_CLASS.negotiation ?? 'bg-amber-50 text-amber-900',
  won: STAGE_BADGE_TONE_CLASS.won ?? 'bg-emerald-100 text-emerald-900',
  lost: STAGE_BADGE_TONE_CLASS.lost ?? 'bg-rose-50 text-rose-800',
  confirmed: STAGE_BADGE_TONE_CLASS.confirmed ?? 'bg-teal-50 text-teal-800',
};

export type { StatusTone };

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg border border-black/[0.04] px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide shadow-sm',
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
