import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

interface Props {
  onStart: () => void;
  highScore: number;
}

export default function HomeScreen({ onStart, highScore }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-stone-900 justify-between items-center py-10">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="items-center mt-20">
        <View className="bg-primary/20 p-6 rounded-full mb-6">
          <Text className="text-6xl">🏏</Text>
        </View>
        <Text className="text-white text-5xl font-black mb-2 text-center shadow-lg">CRICKET</Text>
        <Text className="text-primary text-4xl font-black text-center shadow-lg">MASTER QUIZ</Text>
      </View>
      
      {/* High Score */}
      <View className="bg-stone-800/80 px-8 py-4 rounded-2xl border border-stone-700">
        <Text className="text-stone-400 text-lg text-center font-bold">HIGH SCORE</Text>
        <Text className="text-white text-3xl text-center font-black mt-1">{highScore}</Text>
      </View>
      
      {/* Play Button */}
      <View className="w-full px-8 mb-10">
        <TouchableOpacity 
          className="bg-primary w-full py-5 rounded-2xl flex-row justify-center items-center shadow-lg active:bg-secondary"
          onPress={onStart}
        >
          <Text className="text-white text-2xl font-black mr-2">PLAY NOW</Text>
          <Text className="text-2xl">▶️</Text>
        </TouchableOpacity>
        
        <Text className="text-stone-500 text-center mt-6 text-sm font-semibold">
          Test your cricket knowledge and score maximum points!
        </Text>
      </View>
    </SafeAreaView>
  );
}
