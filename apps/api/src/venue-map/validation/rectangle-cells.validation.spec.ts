import { BadRequestException } from '@nestjs/common';
import { assertCellsFormFilledRectangle } from './rectangle-cells.validation';

describe('assertCellsFormFilledRectangle', () => {
  it('accepts a filled rectangle', () => {
    const cells = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];

    expect(() => assertCellsFormFilledRectangle(cells)).not.toThrow();
  });

  it('accepts a single cell', () => {
    expect(() => assertCellsFormFilledRectangle([{ x: 3, y: 3 }])).not.toThrow();
  });

  it('rejects an empty cell list', () => {
    expect(() => assertCellsFormFilledRectangle([])).toThrow(BadRequestException);
  });

  it('rejects duplicate cell coordinates', () => {
    const cells = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    expect(() => assertCellsFormFilledRectangle(cells)).toThrow(BadRequestException);
    expect(() => assertCellsFormFilledRectangle(cells)).toThrow('Cell coordinates must be unique.');
  });

  it('rejects a shape with a gap (L-shape missing corner)', () => {
    const cells = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      // (1,1) missing -> 3 cells but bounding box is 2x2 = 4
    ];

    expect(() => assertCellsFormFilledRectangle(cells)).toThrow(BadRequestException);
    expect(() => assertCellsFormFilledRectangle(cells)).toThrow(
      'Cells must form a single filled rectangle with no gaps.',
    );
  });

  it('rejects a non-contiguous shape (two disjoint cells)', () => {
    const cells = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ];

    expect(() => assertCellsFormFilledRectangle(cells)).toThrow(BadRequestException);
  });
});
