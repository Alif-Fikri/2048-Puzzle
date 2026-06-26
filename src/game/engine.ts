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

export function lowestEmptyRow(grid: Grid, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === 0) {
      return r;
    }
  }
  return -1;
}

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

function collapse(grid: Grid): Grid {
  const g = createEmptyGrid();
  for (let c = 0; c < COLS; c++) {
    const vals: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c] !== 0) {
        vals.push(grid[r][c]);
      }
    }
    const startRow = ROWS - vals.length;
    for (let i = 0; i < vals.length; i++) {
      g[startRow + i][c] = vals[i];
    }
  }
  return g;
}

export function reviveClear(grid: Grid): Grid {
  let g = cloneGrid(grid);
  const distinct = Array.from(new Set(g.flat().filter(v => v > 0))).sort(
    (a, b) => a - b,
  );
  for (const value of distinct) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (g[r][c] === value) {
          g[r][c] = 0;
        }
      }
    }
    g = collapse(g);
    if (!isGameOver(g)) {
      break;
    }
  }
  return g;
}

export function randomSpawnValue(rng: () => number = Math.random): number {
  return rng() < 0.8 ? 2 : 4;
}

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
