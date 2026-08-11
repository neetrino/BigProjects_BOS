'use client';

import { clsx } from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export type UnderlineTabOption<T extends string> = {
  value: T;
  label: string;
};

type UnderlineTabsProps<T extends string> = {
  value: T;
  options: readonly UnderlineTabOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

type IndicatorRect = {
  left: number;
  width: number;
};

/** Extra length past the label on each side. */
const INDICATOR_SIDE_PAD_PX = 14;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function UnderlineTabs<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: UnderlineTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<IndicatorRect>({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  function syncIndicator() {
    const activeTab = tabRefs.current.get(value);
    if (!activeTab) {
      return;
    }

    setIndicator({
      left: activeTab.offsetLeft - INDICATOR_SIDE_PAD_PX,
      width: activeTab.offsetWidth + INDICATOR_SIDE_PAD_PX * 2,
    });
    setReady(true);
  }

  useIsomorphicLayoutEffect(() => {
    syncIndicator();
  }, [value, options]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const observer = new ResizeObserver(() => {
      syncIndicator();
    });
    observer.observe(list);
    for (const tab of tabRefs.current.values()) {
      observer.observe(tab);
    }
    window.addEventListener('resize', syncIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncIndicator);
    };
  }, [value, options]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={clsx('relative border-b border-[var(--color-border)]', className)}
    >
      <div className="flex flex-wrap gap-x-10">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(option.value, node);
                } else {
                  tabRefs.current.delete(option.value);
                }
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.value)}
              className={clsx(
                'pb-2.5 pt-1 text-base font-semibold tracking-tight transition-colors duration-200',
                isActive
                  ? 'text-[var(--color-brand)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 h-[3px] rounded-full bg-[var(--color-brand)]"
        style={{
          left: indicator.left,
          width: indicator.width,
          opacity: ready ? 1 : 0,
          transition: ready
            ? 'left 280ms var(--ease-out-premium), width 280ms var(--ease-out-premium), opacity 180ms var(--ease-out-premium)'
            : 'none',
        }}
      />
    </div>
  );
}
