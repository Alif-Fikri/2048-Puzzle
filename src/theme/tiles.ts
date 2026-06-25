// Visual theme for tiles and the board (2048-inspired palette).

export const COLORS = {
  background: '#faf8ef',
  boardBg: '#bbada0',
  emptyCell: '#cdc1b4',
  text: '#776e65',
  textLight: '#f9f6f2',
  accent: '#8f7a66',
  overlay: 'rgba(238, 228, 218, 0.78)',
};

const TILE_COLORS: Record<number, string> = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
};

export function tileColor(value: number): string {
  return TILE_COLORS[value] ?? '#3c3a32'; // dark slate for very high tiles
}

export function tileTextColor(value: number): string {
  return value <= 4 ? COLORS.text : COLORS.textLight;
}

/** Shrink the font for longer numbers so they fit inside a cell. */
export function tileFontSize(value: number, cellSize: number): number {
  const digits = String(value).length;
  const base = cellSize * 0.42;
  if (digits <= 2) {
    return base;
  }
  if (digits === 3) {
    return base * 0.8;
  }
  if (digits === 4) {
    return base * 0.62;
  }
  return base * 0.5;
}
