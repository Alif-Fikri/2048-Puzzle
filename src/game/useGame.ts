import { useCallback, useState } from 'react';
import {
  Grid,
  createEmptyGrid,
  drop as dropTile,
  isColumnFull,
  isGameOver,
  maxTile,
  randomSpawnValue,
  reviveClear,
} from './engine';

export type GameState = {
  grid: Grid;
  next: number;
  score: number;
  best: number;
  best32: number;
  isOver: boolean;
  revivedUsed: boolean;
};

export type Game = GameState & {
  canRevive: boolean;
  dropAt: (col: number) => void;
  restart: () => void;
  revive: () => void;
};

function freshState(best: number): GameState {
  return {
    grid: createEmptyGrid(),
    next: randomSpawnValue(),
    score: 0,
    best,
    best32: 0,
    isOver: false,
    revivedUsed: false,
  };
}

export function useGame(initialBest: number = 0): Game {
  const [state, setState] = useState<GameState>(() => freshState(initialBest));

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
        ...prev,
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

  const revive = useCallback(() => {
    setState(prev => {
      if (!prev.isOver || prev.revivedUsed) {
        return prev;
      }
      return {
        ...prev,
        grid: reviveClear(prev.grid),
        isOver: false,
        revivedUsed: true,
      };
    });
  }, []);

  return {
    ...state,
    canRevive: state.isOver && !state.revivedUsed,
    dropAt,
    restart,
    revive,
  };
}
