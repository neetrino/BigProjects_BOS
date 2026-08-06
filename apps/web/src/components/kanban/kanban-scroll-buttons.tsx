'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const SCROLL_STEP_PX = 280;
const HOVER_SCROLL_PX_PER_SECOND = 360;

const BUTTON_CLASS =
  'absolute top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--color-fg)] shadow-[var(--shadow-soft)] outline outline-1 outline-[var(--color-border)] backdrop-blur-sm transition-[background-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-premium)] hover:bg-[var(--color-accent-soft)] hover:shadow-[var(--shadow-lift)] hover:outline-[var(--color-accent)]/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white/95 disabled:hover:shadow-[var(--shadow-soft)] disabled:active:scale-100';

/** Center of the circle sits on the board edge (half outside). */
const LEFT_BUTTON_CLASS = `${BUTTON_CLASS} left-0 -translate-x-1/2`;
const RIGHT_BUTTON_CLASS = `${BUTTON_CLASS} right-0 translate-x-1/2`;

type KanbanScrollButtonsProps = {
  scrollerRef: RefObject<HTMLDivElement | null>;
  layoutKey: string;
};

export function KanbanScrollButtons({ scrollerRef, layoutKey }: KanbanScrollButtonsProps) {
  const t = useTranslations('common');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const hoverRafRef = useRef<number | null>(null);
  const hoverLastTsRef = useRef<number | null>(null);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 1);
    setCanScrollRight(maxScrollLeft - node.scrollLeft > 1);
  }, [scrollerRef]);

  const stopHoverScroll = useCallback(() => {
    if (hoverRafRef.current !== null) {
      window.cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
    hoverLastTsRef.current = null;
  }, []);

  const startHoverScroll = useCallback(
    (direction: -1 | 1) => {
      stopHoverScroll();

      const tick = (timestamp: number) => {
        const node = scrollerRef.current;
        if (!node) {
          stopHoverScroll();
          return;
        }

        const lastTs = hoverLastTsRef.current ?? timestamp;
        hoverLastTsRef.current = timestamp;
        const deltaPx = ((timestamp - lastTs) / 1000) * HOVER_SCROLL_PX_PER_SECOND;
        node.scrollBy({ left: direction * deltaPx });

        const maxScrollLeft = node.scrollWidth - node.clientWidth;
        const atStart = node.scrollLeft <= 1;
        const atEnd = maxScrollLeft - node.scrollLeft <= 1;
        if ((direction < 0 && atStart) || (direction > 0 && atEnd)) {
          stopHoverScroll();
          updateScrollState();
          return;
        }

        hoverRafRef.current = window.requestAnimationFrame(tick);
      };

      hoverRafRef.current = window.requestAnimationFrame(tick);
    },
    [scrollerRef, stopHoverScroll, updateScrollState],
  );

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }

    updateScrollState();
    const rafId = window.requestAnimationFrame(updateScrollState);
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);
    for (const child of node.children) {
      observer.observe(child);
    }
    node.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      node.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      stopHoverScroll();
    };
  }, [layoutKey, scrollerRef, stopHoverScroll, updateScrollState]);

  if (!canScrollLeft && !canScrollRight) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label={t('scrollLeft')}
        disabled={!canScrollLeft}
        onClick={() => scrollerRef.current?.scrollBy({ left: -SCROLL_STEP_PX, behavior: 'smooth' })}
        onPointerEnter={() => {
          if (canScrollLeft) {
            startHoverScroll(-1);
          }
        }}
        onPointerLeave={stopHoverScroll}
        className={LEFT_BUTTON_CLASS}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={t('scrollRight')}
        disabled={!canScrollRight}
        onClick={() => scrollerRef.current?.scrollBy({ left: SCROLL_STEP_PX, behavior: 'smooth' })}
        onPointerEnter={() => {
          if (canScrollRight) {
            startHoverScroll(1);
          }
        }}
        onPointerLeave={stopHoverScroll}
        className={RIGHT_BUTTON_CLASS}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </>
  );
}
