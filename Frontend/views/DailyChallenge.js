import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  useColorScheme,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './stylesheet';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const challenges = [
  {
    id: 'sentadillas',
    title: 'Haz 20 sentadillas',
    description: 'Fortalece tus piernas y glúteos con este ejercicio básico.',
    badge: require('../assets/badge.jpg'),
  },
  {
    id: 'agua',
    title: 'Bebe 2L de agua',
    description: 'Mantente hidratado durante el día para mejorar tu energía.',
    badge: require('../assets/badge.jpg'),
  },
  {
    id: 'respiracion',
    title: 'Respira profundo 5 veces',
    description: 'Reduce el estrés y mejora tu concentración.',
    badge: require('../assets/badge.jpg'),
  },
];

export default function DailyChallenge() {
  const [completed, setCompleted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [expanded, setExpanded] = useState(false);
  const [challenge, setChallenge] = useState(challenges[0]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const loadStatus = async () => {
      const status = await AsyncStorage.getItem('challengeCompleted');
      const savedDate = await AsyncStorage.getItem('challengeDate');
      const today = new Date().toISOString().split('T')[0];

      if (savedDate !== today) {
        await AsyncStorage.removeItem('challengeCompleted');
        await AsyncStorage.setItem('challengeDate', today);
        setCompleted(false);
        setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
      } else if (status === 'true') {
        setCompleted(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    };
    loadStatus();
  }, []);

  const completeChallenge = async () => {
    await AsyncStorage.setItem('challengeCompleted', 'true');
    setCompleted(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <Text style={styles.title}>Desafío del día</Text>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Image source={challenge.badge} style={styles.badge} />

      {!completed ? (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={completeChallenge}
        >
          <Text style={styles.buttonText}>Marcar como completado</Text>
        </Pressable>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.completedText}>¡Reto completado!</Text>
        </Animated.View>
      )}

      <Pressable style={styles.expandButton} onPress={toggleExpand}>
        <Text style={styles.expandButtonText}>
          {expanded ? 'Ver menos' : 'Saber más'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.extraContent}>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
      )}
    </View>
  );
}