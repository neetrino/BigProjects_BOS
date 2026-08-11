'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';

export type CardMetaIconTone = 'brand' | 'brass' | 'success' | 'accent';

const TONE_CLASS: Record<CardMetaIconTone, string> = {
  brand: 'bg-[var(--color-accent-soft)] text-[var(--color-brand)]',
  brass: 'bg-[var(--color-brass-soft)] text-[#8a6b3d]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
};

type CardMetaIconProps = {
  icon: LucideIcon;
  tone: CardMetaIconTone;
};

export function CardMetaIcon({ icon: Icon, tone }: CardMetaIconProps) {
  return (
    <span
      className={clsx(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
        TONE_CLASS[tone],
      )}
    >
      <Icon className="size-4" aria-hidden strokeWidth={2.25} />
    </span>
  );
}

type CardMetaRowProps = {
  icon: LucideIcon;
  tone: CardMetaIconTone;
  children: ReactNode;
  href?: string;
  onLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function CardMetaRow({ icon, tone, children, href, onLinkClick }: CardMetaRowProps) {
  const body = (
    <>
      <CardMetaIcon icon={icon} tone={tone} />
      <span className="min-w-0 truncate">{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 text-xs font-medium text-[var(--color-accent)]"
        onClick={onLinkClick}
      >
        {body}
      </a>
    );
  }

  return <p className="flex items-center gap-2.5 text-xs text-[var(--color-muted)]">{body}</p>;
}
