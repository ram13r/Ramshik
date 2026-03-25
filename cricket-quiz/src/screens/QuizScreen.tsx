import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Question, getRandomQuestions } from '../data/questions';

interface Props {
  onGameOver: (score: number) => void;
}

export default function QuizScreen({ onGameOver }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  useEffect(() => {
    // Load 10 random questions
    setQuestions(getRandomQuestions(10));
  }, []);

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return; // Prevent double taps
    setSelectedOption(option);
    
    const isCorrect = option === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(s => s + 10);
    } else {
      setLives(l => l - 1);
    }

    setTimeout(() => {
      if (!isCorrect && lives - 1 <= 0) {
        Alert.alert("Game Over!", `You scored ${score} points.`, [{ text: "OK", onPress: () => onGameOver(score) }]);
        return;
      }
      
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
      } else {
        // Level complete
        Alert.alert("Awesome!", `You completed the round with ${isCorrect ? score + 10 : score} points.`, [
          { text: "Finish", onPress: () => onGameOver(isCorrect ? score + 10 : score) }
        ]);
      }
    }, 1500);
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-stone-900 justify-center items-center">
        <Text className="text-white text-xl">Loading Trivia...</Text>
      </SafeAreaView>
    );
  }

  const question = questions[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-stone-900 p-6">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center mb-10 pt-4">
        <View className="bg-stone-800 px-4 py-2 rounded-full flex-row items-center border border-stone-700">
          <Text className="text-lg mr-2">❤️</Text>
          <Text className="text-white font-black text-lg">{lives}</Text>
        </View>
        <Text className="text-stone-400 font-bold text-lg">
          Q {currentIndex + 1}/{questions.length}
        </Text>
        <View className="bg-primary/20 px-4 py-2 rounded-full border border-primary/30">
          <Text className="text-primary font-black text-lg">⭐ {score}</Text>
        </View>
      </View>

      {/* Question Card */}
      <View className="bg-stone-800 p-8 rounded-3xl mb-8 border border-stone-700 shadow-xl min-h-[200px] justify-center">
        <Text className="text-white text-2xl font-bold text-center leading-normal">
          {question.text}
        </Text>
      </View>

      {/* Options */}
      <View className="gap-y-4 flex-1 justify-end pb-8">
        {question.options.map((option, index) => {
          let bgColor = "bg-stone-800";
          let borderColor = "border-stone-700";
          
          if (selectedOption !== null) {
            if (option === question.correctAnswer) {
              bgColor = "bg-green-600";
              borderColor = "border-green-500";
            } else if (option === selectedOption) {
              bgColor = "bg-red-600";
              borderColor = "border-red-500";
            }
          }

          return (
            <TouchableOpacity 
              key={index}
              disabled={selectedOption !== null}
              onPress={() => handleAnswer(option)}
              className={`${bgColor} ${borderColor} border-2 p-5 rounded-2xl flex-row items-center`}
            >
              <View className="w-10 h-10 rounded-full bg-stone-900/50 justify-center items-center mr-4">
                <Text className="text-white font-black text-lg">{['A', 'B', 'C', 'D'][index]}</Text>
              </View>
              <Text className="text-white text-lg font-bold flex-1">{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
