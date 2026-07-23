import { computeContentChecksum } from './snapshot-checksum.util';

describe('computeContentChecksum', () => {
  it('is stable regardless of object key insertion order', () => {
    const a = { title: 'Hall', background: { width: 100, height: 50 } };
    const b = { background: { height: 50, width: 100 }, title: 'Hall' };

    expect(computeContentChecksum(a)).toBe(computeContentChecksum(b));
  });

  it('is stable across repeated calls with the same content', () => {
    const content = { title: 'Hall', areas: [{ code: 'A1', cells: [{ x: 0, y: 0 }] }] };

    const first = computeContentChecksum(content);
    const second = computeContentChecksum(JSON.parse(JSON.stringify(content)));

    expect(first).toBe(second);
  });

  it('changes when the content changes', () => {
    const original = { title: 'Hall', areas: [{ code: 'A1' }] };
    const changed = { title: 'Hall', areas: [{ code: 'A2' }] };

    expect(computeContentChecksum(original)).not.toBe(computeContentChecksum(changed));
  });
});
