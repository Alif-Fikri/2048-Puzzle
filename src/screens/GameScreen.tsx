import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Board from '../components/Board';
import { useGame } from '../game/useGame';
import {
  COLORS,
  tileColor,
  tileFontSize,
  tileTextColor,
} from '../theme/tiles';

const NEXT_SIZE = 56;

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

function GameScreen() {
  const game = useGame();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Merge Mania</Text>
          <View style={styles.scoreRow}>
            <ScoreBox label="SCORE" value={game.score} />
            <ScoreBox label="BEST" value={game.best} />
          </View>
        </View>

        <View style={styles.nextRow}>
          <Text style={styles.nextLabel}>NEXT</Text>
          <View
            style={[
              styles.nextTile,
              { backgroundColor: tileColor(game.next) },
            ]}>
            <Text
              style={[
                styles.nextTileText,
                {
                  color: tileTextColor(game.next),
                  fontSize: tileFontSize(game.next, NEXT_SIZE),
                },
              ]}>
              {game.next}
            </Text>
          </View>
          <Text style={styles.hint}>Tap a column to drop</Text>
        </View>

        <View style={styles.boardWrap}>
          <Board
            grid={game.grid}
            disabled={game.isOver}
            onDropColumn={game.dropAt}
          />

          {game.isOver && (
            <View style={styles.overlay}>
              <Text style={styles.overlayTitle}>Game Over</Text>
              <Text style={styles.overlayScore}>Score {game.score}</Text>
              <TouchableOpacity style={styles.playAgain} onPress={game.restart}>
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.restartBtn} onPress={game.restart}>
          <Text style={styles.restartText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.text,
  },
  scoreRow: {
    flexDirection: 'row',
  },
  scoreBox: {
    backgroundColor: COLORS.boardBg,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#eee4da',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreValue: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: '800',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    alignSelf: 'stretch',
  },
  nextLabel: {
    color: COLORS.text,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 12,
  },
  nextTileText: {
    fontWeight: '800',
  },
  nextTile: {
    width: NEXT_SIZE,
    height: NEXT_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginLeft: 'auto',
    color: COLORS.accent,
    fontStyle: 'italic',
  },
  boardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
  },
  overlayScore: {
    fontSize: 20,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 20,
  },
  playAgain: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  playAgainText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '800',
  },
  restartBtn: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  restartText: {
    color: COLORS.textLight,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default GameScreen;
