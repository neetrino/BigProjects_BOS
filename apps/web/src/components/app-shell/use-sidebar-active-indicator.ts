'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

const INDICATOR_TRANSITION_MS = 280;

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

/**
 * Map a target's viewport box into the ancestor's local CSS pixels.
 * Works with CSS zoom because both rects share the same visual scale.
 */
function measureInAncestor(
  element: HTMLElement,
  ancestor: HTMLElement,
): { top: number; left: number; width: number; height: number } {
  const ancestorRect = ancestor.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const scaleX = ancestorRect.width > 0 ? ancestor.offsetWidth / ancestorRect.width : 1;
  const scaleY = ancestorRect.height > 0 ? ancestor.offsetHeight / ancestorRect.height : 1;

  return {
    top: (elementRect.top - ancestorRect.top) * scaleY + ancestor.scrollTop,
    left: (elementRect.left - ancestorRect.left) * scaleX + ancestor.scrollLeft,
    width: elementRect.width * scaleX,
    height: elementRect.height * scaleY,
  };
}

type UseSidebarActiveIndicatorResult = {
  navRef: RefObject<HTMLDivElement | null>;
  indicatorStyle: CSSProperties;
  isMoving: boolean;
};

export function useSidebarActiveIndicator(
  activeId: string | null,
  layoutKey: string,
): UseSidebarActiveIndicatorResult {
  const navRef = useRef<HTMLDivElement | null>(null);
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
      if (!target || target.getClientRects().length === 0) {
        setMetrics((prev) => ({ ...prev, visible: false }));
        return;
      }

      const next = measureInAncestor(target, nav);
      setMetrics({
        top: next.top,
        left: next.left,
        width: next.width,
        height: next.height,
        visible: next.width > 0 && next.height > 0,
      });
    };

    const activeChanged = prevActiveIdRef.current !== activeId;
    const shouldAnimate = hasMeasuredRef.current && activeChanged;
    prevActiveIdRef.current = activeId;
    hasMeasuredRef.current = true;

    let rafId = 0;
    let moveTimer = 0;

    if (shouldAnimate) {
      setIsMoving(true);
      rafId = window.requestAnimationFrame(() => {
        measure();
      });
      moveTimer = window.setTimeout(() => {
        setIsMoving(false);
        measure();
      }, INDICATOR_TRANSITION_MS);
    } else {
      measure();
      setIsMoving(false);
    }

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(nav);
    const target = activeId
      ? nav.querySelector<HTMLElement>(`[data-sidebar-nav="${activeId}"]`)
      : null;
    if (target) {
      observer.observe(target);
    }

    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(moveTimer);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [activeId, layoutKey]);

  return {
    navRef,
    indicatorStyle: {
      transform: `translate3d(${metrics.left}px, ${metrics.top}px, 0)`,
      width: metrics.width,
      height: metrics.height,
      opacity: metrics.visible ? 1 : 0,
    },
    isMoving,
  };
}
