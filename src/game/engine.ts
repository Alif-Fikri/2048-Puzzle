/**
 * Merge Mania — core game engine (pure, no React, no side-effects).
 *
 * Mechanic ("drop the number"):
 *  - Grid is COLS wide x ROWS tall. grid[row][col], row 0 = top. 0 = empty.
 *  - A numbered tile is dropped into a column; it falls to the lowest empty cell.
 *  - After landing, it merges with an orthogonally-adjacent tile of equal value:
 *    the neighbour is removed and the active tile's value doubles. Gravity then
 *    pulls tiles down, which can create new adjacencies -> chain merges.
 *  - Game over when every column's top cell is filled (no legal drop remains).
 *
 * Everything here is deterministic given its inputs, so it is fully unit-testable.
 */

export const COLS = 5;
export const ROWS = 7;

export type Grid = number[][];
export type Cell = { r: number; c: number };
export type DropResult = { grid: Grid; gained: number; merges: number };

export function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<number>(COLS).fill(0));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => row.slice());
}

/** A column is full when its top cell is occupied (gravity packs tiles to the bottom). */
export function isColumnFull(grid: Grid, col: number): boolean {
  return grid[0][col] !== 0;
}

export function legalColumns(grid: Grid): number[] {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!isColumnFull(grid, c)) {
      cols.push(c);
    }
  }
  return cols;
}

export function isGameOver(grid: Grid): boolean {
  return legalColumns(grid).length === 0;
}

/** Lowest empty row in a column (the cell a dropped tile lands in), or -1 if full. */
export function lowestEmptyRow(grid: Grid, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === 0) {
      return r;
    }
  }
  return -1;
}

// Orthogonal neighbour offsets in merge priority order: below, left, right, above.
const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, 0],
];

function equalNeighbours(grid: Grid, r: number, c: number, value: number): Cell[] {
  const found: Cell[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === value) {
      found.push({ r: nr, c: nc });
    }
  }
  return found;
}

/**
 * Pull every tile down within its column. Returns the new position of `tracked`
 * (the active tile) after compaction, since merging can open gaps beneath it.
 */
function applyGravity(grid: Grid, tracked: Cell): Cell {
  let next = tracked;
  for (let c = 0; c < COLS; c++) {
    const vals: number[] = [];
    const fromRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c] !== 0) {
        vals.push(grid[r][c]);
        fromRows.push(r);
      }
    }
    for (let r = 0; r < ROWS; r++) {
      grid[r][c] = 0;
    }
    const startRow = ROWS - vals.length;
    for (let i = 0; i < vals.length; i++) {
      const newRow = startRow + i;
      grid[newRow][c] = vals[i];
      if (tracked.c === c && fromRows[i] === tracked.r) {
        next = { r: newRow, c };
      }
    }
  }
  return next;
}

/**
 * Drop `value` into `col`. Returns the resulting grid, score gained, and merge
 * count, or null if the column is full (illegal move).
 */
export function drop(grid: Grid, col: number, value: number): DropResult | null {
  const landRow = lowestEmptyRow(grid, col);
  if (landRow < 0) {
    return null;
  }

  const g = cloneGrid(grid);
  g[landRow][col] = value;

  let active: Cell = { r: landRow, c: col };
  let activeVal = value;
  let gained = 0;
  let merges = 0;

  // Chain: doubling the active tile can match a freshly-fallen neighbour.
  while (true) {
    const eq = equalNeighbours(g, active.r, active.c, activeVal);
    if (eq.length === 0) {
      break;
    }
    const neighbour = eq[0];
    g[neighbour.r][neighbour.c] = 0;
    activeVal *= 2;
    g[active.r][active.c] = activeVal;
    gained += activeVal;
    merges += 1;
    active = applyGravity(g, active);
  }

  return { grid: g, gained, merges };
}

/** Weighted spawn: mostly 2s, occasionally 4s. `rng` defaults to Math.random. */
export function randomSpawnValue(rng: () => number = Math.random): number {
  return rng() < 0.8 ? 2 : 4;
}

/** Highest tile currently on the board (0 if empty) — handy for UI / milestones. */
export function maxTile(grid: Grid): number {
  let max = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] > max) {
        max = grid[r][c];
      }
    }
  }
  return max;
}
