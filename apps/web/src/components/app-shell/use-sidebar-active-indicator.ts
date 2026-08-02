'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

const INDICATOR_TRANSITION_MS = 300;
const ACCORDION_SETTLE_MS = 320;

type IndicatorMetrics = {
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
};

const INITIAL_METRICS: IndicatorMetrics = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  visible: false,
};

function offsetRelativeTo(
  element: HTMLElement,
  ancestor: HTMLElement,
): { top: number; left: number; width: number; height: number } {
  const ancestorRect = ancestor.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const scaleX = ancestorRect.width / ancestor.offsetWidth || 1;
  const scaleY = ancestorRect.height / ancestor.offsetHeight || 1;

  return {
    top: (elementRect.top - ancestorRect.top) / scaleY + ancestor.scrollTop,
    left: (elementRect.left - ancestorRect.left) / scaleX + ancestor.scrollLeft,
    width: elementRect.width / scaleX,
    height: elementRect.height / scaleY,
  };
}

type UseSidebarActiveIndicatorResult = {
  navRef: RefObject<HTMLElement | null>;
  indicatorStyle: CSSProperties;
  isMoving: boolean;
};

export function useSidebarActiveIndicator(
  activeId: string | null,
  layoutKey: string,
): UseSidebarActiveIndicatorResult {
  const navRef = useRef<HTMLElement | null>(null);
  const hasMeasuredRef = useRef(false);
  const prevActiveIdRef = useRef<string | null | undefined>(undefined);
  const [metrics, setMetrics] = useState<IndicatorMetrics>(INITIAL_METRICS);
  const [isMoving, setIsMoving] = useState(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) {
      return;
    }

    const measure = (): void => {
      if (!activeId) {
        setMetrics((prev) => ({ ...prev, visible: false }));
        return;
      }

      const target = nav.querySelector<HTMLElement>(`[data-sidebar-nav="${activeId}"]`);
      if (!target) {
        setMetrics((prev) => ({ ...prev, visible: false }));
        return;
      }

      const next = offsetRelativeTo(target, nav);
      setMetrics({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
        visible: next.height > 0 && next.width > 0,
      });
    };

    const activeChanged = prevActiveIdRef.current !== activeId;
    const shouldAnimate = hasMeasuredRef.current && activeChanged;
    prevActiveIdRef.current = activeId;
    hasMeasuredRef.current = true;

    let rafId = 0;
    let settleTimer = 0;

    if (shouldAnimate) {
      setIsMoving(true);
      rafId = window.requestAnimationFrame(() => {
        measure();
      });
      settleTimer = window.setTimeout(() => {
        setIsMoving(false);
      }, INDICATOR_TRANSITION_MS);
    } else {
      measure();
      setIsMoving(false);
      settleTimer = window.setTimeout(() => {
        measure();
      }, ACCORDION_SETTLE_MS);
    }

    const onResize = (): void => {
      measure();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [activeId, layoutKey]);

  return {
    navRef,
    indicatorStyle: {
      transform: `translate(${metrics.left}px, ${metrics.top}px)`,
      width: metrics.width,
      height: metrics.height,
      opacity: metrics.visible ? 1 : 0,
    },
    isMoving,
  };
}
