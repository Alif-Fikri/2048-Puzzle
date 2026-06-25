import {
  COLS,
  ROWS,
  createEmptyGrid,
  drop,
  isColumnFull,
  isGameOver,
  legalColumns,
  lowestEmptyRow,
  maxTile,
  randomSpawnValue,
} from './engine';

describe('grid basics', () => {
  it('creates an empty ROWS x COLS grid', () => {
    const g = createEmptyGrid();
    expect(g.length).toBe(ROWS);
    expect(g[0].length).toBe(COLS);
    expect(g.flat().every(v => v === 0)).toBe(true);
  });

  it('drops a tile to the bottom of an empty column', () => {
    const g = createEmptyGrid();
    expect(lowestEmptyRow(g, 2)).toBe(ROWS - 1);
    const res = drop(g, 2, 2)!;
    expect(res.grid[ROWS - 1][2]).toBe(2);
    expect(res.gained).toBe(0);
    expect(res.merges).toBe(0);
  });
});

describe('merging', () => {
  it('merges two equal tiles stacked vertically and doubles the value', () => {
    let g = createEmptyGrid();
    g = drop(g, 0, 2)!.grid; // bottom of col 0
    const res = drop(g, 0, 2)!; // lands on top of it -> merge
    expect(res.gained).toBe(4);
    expect(res.merges).toBe(1);
    // single 4 sitting at the bottom of col 0, rest empty
    expect(res.grid[ROWS - 1][0]).toBe(4);
    expect(maxTile(res.grid)).toBe(4);
    expect(res.grid.flat().filter(v => v !== 0).length).toBe(1);
  });

  it('chains: 2 dropped next to a 2 and a 4 yields a single 8', () => {
    // Build: col0 bottom = 4, col1 bottom = 2. Drop a 2 into col1 -> merges to 4,
    // which is adjacent to the 4 in col0 -> chains to 8.
    let g = createEmptyGrid();
    g[ROWS - 1][0] = 4;
    g[ROWS - 1][1] = 2;
    const res = drop(g, 1, 2)!;
    expect(maxTile(res.grid)).toBe(8);
    expect(res.merges).toBe(2);
    expect(res.gained).toBe(4 + 8); // first merge -> 4, chain merge -> 8
    expect(res.grid.flat().filter(v => v !== 0).length).toBe(1);
  });

  it('does not merge unequal neighbours', () => {
    let g = createEmptyGrid();
    g = drop(g, 0, 2)!.grid;
    const res = drop(g, 0, 4)!;
    expect(res.merges).toBe(0);
    expect(res.grid[ROWS - 1][0]).toBe(2);
    expect(res.grid[ROWS - 2][0]).toBe(4);
  });
});

describe('game over', () => {
  it('reports a full column and rejects drops into it', () => {
    let g = createEmptyGrid();
    // Fill column 3 with non-mergeable alternating values so nothing collapses.
    for (let r = 0; r < ROWS; r++) {
      g[r][3] = r % 2 === 0 ? 2 : 4;
    }
    expect(isColumnFull(g, 3)).toBe(true);
    expect(drop(g, 3, 8)).toBeNull();
    expect(legalColumns(g)).not.toContain(3);
    expect(isGameOver(g)).toBe(false);
  });

  it('detects game over when every column is full', () => {
    const g = createEmptyGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        g[r][c] = (r + c) % 2 === 0 ? 2 : 4;
      }
    }
    expect(isGameOver(g)).toBe(true);
    expect(legalColumns(g)).toHaveLength(0);
  });
});

describe('spawn', () => {
  it('returns 2 or 4 with the expected weighting', () => {
    expect(randomSpawnValue(() => 0.1)).toBe(2);
    expect(randomSpawnValue(() => 0.9)).toBe(4);
  });
});
