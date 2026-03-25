import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';

export default function App() {
  const [screen, setScreen] = useState<'HOME' | 'QUIZ'>('HOME');
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    // AdMob initialization will be added for the final APK build
  }, []);

  const handleGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    setScreen('HOME');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1917' }}> 
      {/* #1c1917 is stone-900 equivalent for the safe area wrapper */}
      
      {screen === 'HOME' ? (
        <HomeScreen onStart={() => setScreen('QUIZ')} highScore={highScore} />
      ) : (
        <QuizScreen onGameOver={handleGameOver} />
      )}
      
      <StatusBar style="light" />

      {/* Banner Ad placeholder for Expo Go */}
      <View style={{ width: '100%', alignItems: 'center', backgroundColor: '#1c1917', paddingBottom: 10 }}>
        <Text style={{ color: '#fed7aa', marginTop: 10, fontSize: 12 }}>Advertisement Space (Active in APK)</Text>
      </View>
    </SafeAreaView>
  );
}
