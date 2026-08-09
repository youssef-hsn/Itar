import { useCallback, useEffect, useRef, useState } from 'react';

const GAP = 8;
const MARGIN = 8;

type Position = { top: number; left: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const place = (anchor: DOMRect, panel: DOMRect): Position => {
  const maxTop = Math.max(MARGIN, window.innerHeight - panel.height - MARGIN);
  const maxLeft = Math.max(MARGIN, window.innerWidth - panel.width - MARGIN);
  const fitsLeft = anchor.left - panel.width - GAP >= MARGIN;
  const fitsRight = anchor.right + panel.width + GAP <= window.innerWidth - MARGIN;

  if (!fitsLeft && !fitsRight) {
    return {
      left: clamp(anchor.left, MARGIN, maxLeft),
      top: clamp(anchor.bottom + GAP, MARGIN, maxTop),
    };
  }

  return {
    left: fitsLeft ? anchor.left - panel.width - GAP : anchor.right + GAP,
    top: clamp(anchor.top, MARGIN, maxTop),
  };
};

export const useAnchoredPopover = (autoFocusSelector: string) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const reposition = useCallback(() => {
    const panel = popoverRef.current;
    const anchor = anchorRef.current;
    if (!panel || !anchor) {
      return;
    }
    setPosition(place(anchor.getBoundingClientRect(), panel.getBoundingClientRect()));
  }, []);

  const setAnchor = useCallback((anchor: HTMLElement | null) => {
    anchorRef.current = anchor;
  }, []);

  const open = useCallback((anchor: HTMLElement) => {
    anchorRef.current = anchor;
    setPosition(null);
    popoverRef.current?.showPopover();
  }, []);

  const close = useCallback(() => {
    popoverRef.current?.hidePopover();
  }, []);

  useEffect(() => {
    const panel = popoverRef.current;
    if (!panel) {
      return;
    }

    const onToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === 'open';
      setIsOpen(opened);

      if (opened) {
        reposition();
        panel.querySelector<HTMLElement>(autoFocusSelector)?.focus();
        return;
      }

      anchorRef.current?.focus();
      anchorRef.current = null;
    };

    panel.addEventListener('toggle', onToggle);
    return () => panel.removeEventListener('toggle', onToggle);
  }, [autoFocusSelector, reposition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen, reposition]);

  return { popoverRef, isOpen, position, open, close, setAnchor, reposition };
};
