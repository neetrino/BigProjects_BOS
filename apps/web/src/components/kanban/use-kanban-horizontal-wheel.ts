'use client';

import { useEffect, type RefObject } from 'react';

function canScrollVertically(element: HTMLElement, deltaY: number): boolean {
  const overflowY = window.getComputedStyle(element).overflowY;
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false;
  }
  if (element.scrollHeight <= element.clientHeight + 1) {
    return false;
  }
  if (deltaY < 0) {
    return element.scrollTop > 0;
  }
  return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
}

function targetPrefersVerticalScroll(
  target: EventTarget | null,
  boundary: HTMLElement,
  deltaY: number,
): boolean {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== boundary) {
    if (canScrollVertically(node, deltaY)) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

/** Maps vertical mouse wheel to horizontal board scroll (keeps column list scroll). */
export function useKanbanHorizontalWheel(scrollerRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        return;
      }
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }
      if (event.deltaY === 0) {
        return;
      }
      if (node.scrollWidth <= node.clientWidth + 1) {
        return;
      }
      if (targetPrefersVerticalScroll(event.target, node, event.deltaY)) {
        return;
      }

      const maxScrollLeft = node.scrollWidth - node.clientWidth;
      const nextScrollLeft = node.scrollLeft + event.deltaY;
      if (nextScrollLeft <= 0 && node.scrollLeft <= 0) {
        return;
      }
      if (nextScrollLeft >= maxScrollLeft && node.scrollLeft >= maxScrollLeft - 1) {
        return;
      }

      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', onWheel);
    };
  }, [scrollerRef]);
}
