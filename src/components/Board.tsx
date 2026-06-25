import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLS, Grid, ROWS, isColumnFull } from '../game/engine';
import {
  COLORS,
  tileColor,
  tileFontSize,
  tileTextColor,
} from '../theme/tiles';

const GAP = 8;
const BOARD_MARGIN = 16;

const screenWidth = Dimensions.get('window').width;
const boardWidth = screenWidth - BOARD_MARGIN * 2;
const CELL = (boardWidth - GAP * (COLS + 1)) / COLS;
const boardHeight = CELL * ROWS + GAP * (ROWS + 1);

type Props = {
  grid: Grid;
  disabled?: boolean;
  onDropColumn: (col: number) => void;
};

function Cell({ value }: { value: number }) {
  if (value === 0) {
    return <View style={[styles.cell, styles.emptyCell]} />;
  }
  return (
    <View style={[styles.cell, { backgroundColor: tileColor(value) }]}>
      <Text
        style={[
          styles.cellText,
          { color: tileTextColor(value), fontSize: tileFontSize(value, CELL) },
        ]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Board({ grid, disabled, onDropColumn }: Props) {
  return (
    <View style={styles.board}>
      {Array.from({ length: COLS }, (_, c) => {
        const columnFull = isColumnFull(grid, c);
        return (
          <Pressable
            key={c}
            disabled={disabled || columnFull}
            onPress={() => onDropColumn(c)}
            style={({ pressed }) => [
              styles.column,
              pressed && !columnFull && styles.columnPressed,
            ]}>
            {Array.from({ length: ROWS }, (_unused, r) => (
              <Cell key={r} value={grid[r][c]} />
            ))}
          </Pressable>
        );
      })}
    </View>
  );
}

export const CELL_SIZE = CELL;

const styles = StyleSheet.create({
  board: {
    width: boardWidth,
    height: boardHeight,
    backgroundColor: COLORS.boardBg,
    borderRadius: 12,
    padding: GAP,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  columnPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    backgroundColor: COLORS.emptyCell,
  },
  cellText: {
    fontWeight: '800',
  },
});

export default Board;
