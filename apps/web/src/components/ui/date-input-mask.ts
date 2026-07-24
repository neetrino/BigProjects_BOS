const DAY_AUTO_PAD_MIN = 4;
const MONTH_AUTO_PAD_MIN = 2;
const SLOT_MAX = { day: 2, month: 2, year: 4 } as const;

type DateSlots = {
  day: string;
  month: string;
  year: string;
};

type SlotName = keyof DateSlots;

export type DateMaskEdit = {
  display: string;
  caret: number;
};

function slotsFromDisplay(display: string): DateSlots {
  const parts = display.split('.');
  return {
    day: (parts[0] ?? '').replace(/\D/g, '').slice(0, SLOT_MAX.day),
    month: (parts[1] ?? '').replace(/\D/g, '').slice(0, SLOT_MAX.month),
    year: (parts[2] ?? '').replace(/\D/g, '').slice(0, SLOT_MAX.year),
  };
}

function displayFromSlots(slots: DateSlots): string {
  const { day, month, year } = slots;
  if (!day && !month && !year) {
    return '';
  }
  if (!month && !year) {
    return day.length >= SLOT_MAX.day ? `${day}.` : day;
  }
  if (!year) {
    return month.length >= SLOT_MAX.month ? `${day}.${month}.` : `${day}.${month}`;
  }
  return `${day}.${month}.${year}`;
}

function countDigits(value: string): number {
  return value.replace(/\D/g, '').length;
}

/** Maps an existing digit index (0-based) to its slot. */
function digitIndexToSlot(
  digitIndex: number,
  slots: DateSlots,
): { slot: SlotName; localOffset: number } {
  if (digitIndex < slots.day.length) {
    return { slot: 'day', localOffset: digitIndex };
  }
  const afterDay = digitIndex - slots.day.length;
  if (afterDay < slots.month.length) {
    return { slot: 'month', localOffset: afterDay };
  }
  return {
    slot: 'year',
    localOffset: afterDay - slots.month.length,
  };
}

/**
 * Maps caret position (count of digits before caret) to insert/overwrite target.
 * Incomplete day/month keep receiving digits before jumping to the next slot.
 */
function insertionPoint(
  digitIndex: number,
  slots: DateSlots,
): { slot: SlotName; localOffset: number } {
  const dayLen = slots.day.length;
  if (digitIndex < dayLen) {
    return { slot: 'day', localOffset: digitIndex };
  }
  if (digitIndex === dayLen && dayLen < SLOT_MAX.day) {
    return { slot: 'day', localOffset: dayLen };
  }

  const inMonth = digitIndex - dayLen;
  const monthLen = slots.month.length;
  if (inMonth < monthLen) {
    return { slot: 'month', localOffset: inMonth };
  }
  if (inMonth === monthLen && monthLen < SLOT_MAX.month) {
    return { slot: 'month', localOffset: monthLen };
  }

  const inYear = inMonth - monthLen;
  return { slot: 'year', localOffset: Math.min(inYear, SLOT_MAX.year) };
}

function caretAfterSlotDigit(slots: DateSlots, slot: SlotName, digitOffset: number): number {
  const display = displayFromSlots(slots);
  const dayEnd = slots.day.length;
  const monthStart = slots.month || slots.year ? dayEnd + 1 : dayEnd;
  const monthEnd = monthStart + slots.month.length;
  const yearStart = slots.year ? monthEnd + 1 : monthEnd;
  if (slot === 'day') {
    return Math.min(digitOffset, dayEnd);
  }
  if (slot === 'month') {
    return Math.min(monthStart + digitOffset, monthEnd);
  }
  return Math.min(yearStart + digitOffset, display.length);
}

function autoPadSlot(slot: SlotName, digits: string): string {
  if (slot === 'day' && digits.length === 1) {
    const n = Number(digits);
    if (n >= DAY_AUTO_PAD_MIN && n <= 9) {
      return `0${digits}`;
    }
  }
  if (slot === 'month' && digits.length === 1) {
    const n = Number(digits);
    if (n >= MONTH_AUTO_PAD_MIN && n <= 9) {
      return `0${digits}`;
    }
  }
  return digits.slice(0, SLOT_MAX[slot]);
}

function appendDigit(slots: DateSlots, digit: string): DateSlots {
  if (slots.day.length < SLOT_MAX.day) {
    return { ...slots, day: autoPadSlot('day', slots.day + digit) };
  }
  if (slots.month.length < SLOT_MAX.month) {
    return { ...slots, month: autoPadSlot('month', slots.month + digit) };
  }
  if (slots.year.length < SLOT_MAX.year) {
    return { ...slots, year: slots.year + digit };
  }
  return slots;
}

function replaceInSlot(
  slots: DateSlots,
  slot: SlotName,
  localStart: number,
  localEnd: number,
  digit: string,
): DateSlots {
  const current = slots[slot];
  const next = `${current.slice(0, localStart)}${digit}${current.slice(localEnd)}`.slice(
    0,
    SLOT_MAX[slot],
  );
  return { ...slots, [slot]: next };
}

function clearAcrossSlots(
  slots: DateSlots,
  from: { slot: SlotName; localOffset: number },
  to: { slot: SlotName; localOffset: number },
): DateSlots {
  const next = { ...slots };
  next[from.slot] = next[from.slot].slice(0, from.localOffset);
  if (from.slot === 'day' && to.slot === 'month') {
    next.month = next.month.slice(to.localOffset + 1);
  } else if (from.slot === 'day' && to.slot === 'year') {
    next.month = '';
    next.year = next.year.slice(to.localOffset + 1);
  } else if (from.slot === 'month' && to.slot === 'year') {
    next.year = next.year.slice(to.localOffset + 1);
  }
  return next;
}

/** Insert/replace a digit while keeping day/month/year slots independent. */
export function applyDateDigitInput(
  display: string,
  selectionStart: number,
  selectionEnd: number,
  digit: string,
): DateMaskEdit {
  if (!/^\d$/.test(digit)) {
    return { display, caret: selectionEnd };
  }

  const slots = slotsFromDisplay(display);
  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);
  const digitStart = countDigits(display.slice(0, start));
  const digitEnd = countDigits(display.slice(0, end));
  const totalDigits = slots.day.length + slots.month.length + slots.year.length;
  const atEnd = digitStart === digitEnd && digitStart === totalDigits;

  if (atEnd) {
    const next = appendDigit(slots, digit);
    const built = displayFromSlots(next);
    return { display: built, caret: built.length };
  }

  let next: DateSlots;
  let caretSlot: SlotName;
  let caretOffset: number;

  if (digitStart !== digitEnd) {
    const from = digitIndexToSlot(digitStart, slots);
    const to = digitIndexToSlot(digitEnd - 1, slots);
    if (from.slot === to.slot) {
      next = replaceInSlot(slots, from.slot, from.localOffset, to.localOffset + 1, digit);
    } else {
      next = replaceInSlot(slots, from.slot, from.localOffset, slots[from.slot].length, digit);
    }
    caretSlot = from.slot;
    caretOffset = from.localOffset + 1;
  } else {
    const point = insertionPoint(digitStart, slots);
    caretSlot = point.slot;
    if (point.localOffset >= slots[point.slot].length) {
      const appended = autoPadSlot(point.slot, slots[point.slot] + digit);
      next = { ...slots, [point.slot]: appended };
      caretOffset = appended.length;
    } else {
      next = replaceInSlot(slots, point.slot, point.localOffset, point.localOffset + 1, digit);
      caretOffset = point.localOffset + 1;
    }
  }

  const built = displayFromSlots(next);
  return {
    display: built,
    caret: caretAfterSlotDigit(next, caretSlot, caretOffset),
  };
}

/** Backspace respecting day/month/year slots and selection. */
export function applyDateBackspace(
  display: string,
  selectionStart: number,
  selectionEnd: number,
): DateMaskEdit {
  const slots = slotsFromDisplay(display);
  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);

  if (start !== end) {
    const digitStart = countDigits(display.slice(0, start));
    const digitEnd = countDigits(display.slice(0, end));
    if (digitStart === digitEnd) {
      return { display, caret: start };
    }
    const from = digitIndexToSlot(digitStart, slots);
    const to = digitIndexToSlot(digitEnd - 1, slots);
    const next =
      from.slot === to.slot
        ? replaceInSlot(slots, from.slot, from.localOffset, to.localOffset + 1, '')
        : clearAcrossSlots(slots, from, to);
    const built = displayFromSlots(next);
    return { display: built, caret: caretAfterSlotDigit(next, from.slot, from.localOffset) };
  }

  if (start === 0) {
    return { display, caret: 0 };
  }

  if (display[start - 1] === '.') {
    return { display, caret: start - 1 };
  }

  const digitIndex = countDigits(display.slice(0, start)) - 1;
  if (digitIndex < 0) {
    return { display, caret: start };
  }

  const { slot, localOffset } = digitIndexToSlot(digitIndex, slots);
  const next = replaceInSlot(slots, slot, localOffset, localOffset + 1, '');
  const built = displayFromSlots(next);
  return { display: built, caret: caretAfterSlotDigit(next, slot, localOffset) };
}
