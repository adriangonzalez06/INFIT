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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#222',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  badge: {
    width: 100,
    height: 100,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedText: {
    fontSize: 18,
    color: '#28a745',
    marginTop: 10,
    textAlign: 'center',
  },
  expandButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ef2b2d',
  },
  expandButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  extraContent: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
});