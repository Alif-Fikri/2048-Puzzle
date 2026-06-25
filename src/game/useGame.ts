import { useCallback, useState } from 'react';
import {
  Grid,
  createEmptyGrid,
  drop as dropTile,
  isColumnFull,
  isGameOver,
  maxTile,
  randomSpawnValue,
} from './engine';

export type GameState = {
  grid: Grid;
  next: number;
  score: number;
  best: number;
  best32: number; // highest tile reached this game, for milestone UI
  isOver: boolean;
};

export type Game = GameState & {
  /** Drop the current `next` tile into a column. No-op if illegal or game over. */
  dropAt: (col: number) => void;
  /** Start a fresh game (keeps best score). */
  restart: () => void;
};

function freshState(best: number): GameState {
  return {
    grid: createEmptyGrid(),
    next: randomSpawnValue(),
    score: 0,
    best,
    best32: 0,
    isOver: false,
  };
}

export function useGame(): Game {
  const [state, setState] = useState<GameState>(() => freshState(0));

  const dropAt = useCallback((col: number) => {
    setState(prev => {
      if (prev.isOver || isColumnFull(prev.grid, col)) {
        return prev;
      }
      const result = dropTile(prev.grid, col, prev.next);
      if (!result) {
        return prev;
      }
      const score = prev.score + result.gained;
      return {
        grid: result.grid,
        next: randomSpawnValue(),
        score,
        best: Math.max(prev.best, score),
        best32: Math.max(prev.best32, maxTile(result.grid)),
        isOver: isGameOver(result.grid),
      };
    });
  }, []);

  const restart = useCallback(() => {
    setState(prev => freshState(prev.best));
  }, []);

  return { ...state, dropAt, restart };
}
