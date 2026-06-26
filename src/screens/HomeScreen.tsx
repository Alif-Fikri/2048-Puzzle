import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const bg = require('../assets/bg.png');
const logo = require('../assets/logo.png');

const AMBER = '#f5a200';
const AMBER_DARK = '#b45309';
const AMBER_LIGHT = '#ffd14d';
const tileColors: Record<number, string> = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
};

type FloatSpec = {
  value: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  range: number;
  rotate: string;
};

function FloatingTile({ spec }: { spec: FloatSpec }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 2600 + spec.delay,
          delay: spec.delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 2600 + spec.delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [spec.delay, t]);

  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [spec.range, -spec.range],
  });

  return (
    <Animated.View
      style={[
        styles.floatTile,
        {
          left: spec.left as `${number}%`,
          top: spec.top as `${number}%`,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size * 0.26,
          backgroundColor: tileColors[spec.value] ?? '#eee4da',
          transform: [{ translateY }, { rotate: spec.rotate }],
        },
      ]}>
      <Text style={[styles.floatText, { fontSize: spec.size * 0.4 }]}>
        {spec.value}
      </Text>
    </Animated.View>
  );
}

function PlayButton({ onPress }: { onPress: () => void }) {
  const press = useRef(new Animated.Value(0)).current;

  const animateTo = (to: number) =>
    Animated.timing(press, {
      toValue: to,
      duration: 90,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

  const translateY = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 9],
  });

  return (
    <Pressable
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      onPress={onPress}
      style={styles.playWrap}>
      <View style={styles.playSide} />
      <Animated.View style={[styles.playFace, { transform: [{ translateY }] }]}>
        <View style={styles.playGloss} />
        <Text style={styles.playText}>PLAY</Text>
      </Animated.View>
    </Pressable>
  );
}

function HomeScreen({ onPlay, best }: { onPlay: () => void; best: number }) {
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lift, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(lift, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lift]);

  const logoFloat = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [6, -6],
  });

  const floats = useMemo<FloatSpec[]>(
    () => [
      { value: 2, left: '8%', top: '12%', size: 56, delay: 0, range: 10, rotate: '-12deg' },
      { value: 8, left: '78%', top: '16%', size: 68, delay: 600, range: 14, rotate: '10deg' },
      { value: 4, left: '14%', top: '70%', size: 60, delay: 300, range: 12, rotate: '8deg' },
      { value: 16, left: '74%', top: '66%', size: 52, delay: 900, range: 9, rotate: '-8deg' },
      { value: 32, left: '46%', top: '80%', size: 46, delay: 1200, range: 11, rotate: '4deg' },
    ],
    [],
  );

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" backgroundColor="#3a1d8a" />
      <View style={styles.tiles} pointerEvents="none">
        {floats.map((f, i) => (
          <FloatingTile key={i} spec={f} />
        ))}
      </View>

      <View style={styles.center}>
        <Animated.View
          style={[styles.logoWrap, { transform: [{ translateY: logoFloat }] }]}>
          <Image source={logo} style={styles.logo} />
        </Animated.View>

        <View style={styles.titleWrap}>
          <Text style={[styles.title, styles.titleShadow]}>MERGE</Text>
          <Text style={styles.title}>MERGE</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={[styles.title2, styles.title2Shadow]}>MANIA</Text>
          <Text style={styles.title2}>MANIA</Text>
        </View>

        <Text style={styles.subtitle}>Tap · Drop · Merge</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.bestPill}>
          <Text style={styles.bestLabel}>BEST</Text>
          <Text style={styles.bestValue}>{best}</Text>
        </View>
        <PlayButton onPress={onPlay} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  tiles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatTile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  floatText: {
    fontWeight: '900',
    color: '#776e65',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logoWrap: {
    shadowColor: '#1a0b3d',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 34,
  },
  titleWrap: {
    height: 64,
    justifyContent: 'center',
  },
  title: {
    fontSize: 58,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleShadow: {
    position: 'absolute',
    color: '#6a3df0',
    transform: [{ translateX: 3 }, { translateY: 5 }],
    textShadowColor: 'transparent',
  },
  title2: {
    fontSize: 58,
    fontWeight: '900',
    color: AMBER_LIGHT,
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title2Shadow: {
    position: 'absolute',
    color: AMBER_DARK,
    transform: [{ translateX: 3 }, { translateY: 5 }],
    textShadowColor: 'transparent',
  },
  subtitle: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 56,
  },
  bestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  bestLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 8,
    fontSize: 13,
  },
  bestValue: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  playWrap: {
    width: 220,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playSide: {
    position: 'absolute',
    top: 9,
    left: 0,
    right: 0,
    height: 63,
    borderRadius: 20,
    backgroundColor: AMBER_DARK,
  },
  playFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 63,
    borderRadius: 20,
    backgroundColor: AMBER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playGloss: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  playText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
