import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import { initAds } from './src/ads/AdService';

type Screen = 'home' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [best, setBest] = useState(0);

  useEffect(() => {
    initAds();
  }, []);

  return (
    <SafeAreaProvider>
      {screen === 'home' ? (
        <HomeScreen best={best} onPlay={() => setScreen('game')} />
      ) : (
        <GameScreen
          initialBest={best}
          onBest={setBest}
          onExit={() => setScreen('home')}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
