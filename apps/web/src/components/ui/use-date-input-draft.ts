'use client';

import { useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import {
  applyDateBackspace,
  applyDateDigitInput,
  isoToDisplayInput,
  parseFlexibleDateInput,
  parseIsoDate,
} from '@/components/ui/date-input-utils';

type UseDateInputDraftArgs = {
  value: string;
  onChange: (value: string) => void;
  onCommitView: (year: number, monthIndex: number) => void;
  onClose: () => void;
};

type UseDateInputDraftResult = {
  draft: string;
  setDraft: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  setFocused: (focused: boolean) => void;
  clearDraft: () => void;
  handleBeforeInput: (event: FormEvent<HTMLInputElement>) => void;
  handleChange: (raw: string) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
};

export function useDateInputDraft({
  value,
  onChange,
  onCommitView,
  onClose,
}: UseDateInputDraftArgs): UseDateInputDraftResult {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => isoToDisplayInput(value));
  const display = focused ? draft : isoToDisplayInput(value);

  function setDraftWithCaret(next: { display: string; caret: number }): void {
    setDraft(next.display);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      const caret = Math.min(next.caret, next.display.length);
      input.setSelectionRange(caret, caret);
    });
  }

  function applyDigitsAtSelection(digits: string, start: number, end: number): void {
    let nextDisplay = draft;
    let selStart = start;
    let selEnd = end;
    let caret = end;
    for (const digit of digits) {
      if (!/^\d$/.test(digit)) {
        continue;
      }
      const applied = applyDateDigitInput(nextDisplay, selStart, selEnd, digit);
      nextDisplay = applied.display;
      caret = applied.caret;
      selStart = caret;
      selEnd = caret;
    }
    setDraftWithCaret({ display: nextDisplay, caret });
  }

  function commitDraft(raw: string, options?: { revertOnInvalid?: boolean }): void {
    const parsed = parseFlexibleDateInput(raw);
    if (parsed === null) {
      if (options?.revertOnInvalid) {
        setDraft(isoToDisplayInput(value));
      }
      return;
    }
    onChange(parsed);
    setDraft(isoToDisplayInput(parsed));
    if (parsed) {
      const next = parseIsoDate(parsed);
      if (next) {
        onCommitView(next.year, next.monthIndex);
      }
    }
  }

  function clearDraft(): void {
    onChange('');
    setDraft('');
  }

  function handleBeforeInput(event: FormEvent<HTMLInputElement>): void {
    const native = event.nativeEvent as InputEvent;
    if (native.inputType !== 'insertText' || !native.data || !/^\d+$/.test(native.data)) {
      return;
    }
    event.preventDefault();
    const input = event.currentTarget;
    applyDigitsAtSelection(
      native.data,
      input.selectionStart ?? draft.length,
      input.selectionEnd ?? draft.length,
    );
  }

  function handleChange(raw: string): void {
    if (/^\d{4}-/.test(raw)) {
      setDraft(raw);
      return;
    }
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let nextDisplay = '';
    let caret = 0;
    for (const digit of digits) {
      const applied = applyDateDigitInput(nextDisplay, caret, caret, digit);
      nextDisplay = applied.display;
      caret = applied.caret;
    }
    setDraft(nextDisplay);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const input = event.currentTarget;
      applyDigitsAtSelection(
        event.key,
        input.selectionStart ?? draft.length,
        input.selectionEnd ?? draft.length,
      );
      return;
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      const input = event.currentTarget;
      setDraftWithCaret(
        applyDateBackspace(
          draft,
          input.selectionStart ?? draft.length,
          input.selectionEnd ?? draft.length,
        ),
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft(draft, { revertOnInvalid: false });
      onClose();
      return;
    }
    if (event.key === 'Escape') {
      setDraft(isoToDisplayInput(value));
      onClose();
    }
  }

  function handleFocus(): void {
    setDraft(isoToDisplayInput(value));
    setFocused(true);
  }

  function handleBlur(): void {
    setFocused(false);
    commitDraft(draft, { revertOnInvalid: true });
  }

  return {
    draft: display,
    setDraft,
    inputRef,
    setFocused: handleFocus,
    clearDraft,
    handleBeforeInput,
    handleChange,
    handleKeyDown,
    handleBlur,
  };
}
