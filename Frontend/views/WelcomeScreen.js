import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Image,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DailyChallenge from './DailyChallenge';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const userName = 'Sergi';
  const streakDays = 12;
  const lastRoutine = 'Piernas y abdomen';
  const lastMeal = 'Ensalada de quinoa';

  const messages = [
    '¡Sigue así, estás logrando grandes cosas!',
    'Cada día cuenta, ¡no te detengas!',
    'Tu constancia es tu mejor herramienta.',
    '¡Hoy es un gran día para superarte!',
  ];

  const [message] = useState(messages[Math.floor(Math.random() * messages.length)]);
  const [showChallenge, setShowChallenge] = useState(false);

  const slideRutinas = useRef(new Animated.Value(100)).current;
  const slideAlimentacion = useRef(new Animated.Value(100)).current;
  const slideChallenge = useRef(new Animated.Value(100)).current;
  const scaleRutinas = useRef(new Animated.Value(1)).current;
  const scaleAlimentacion = useRef(new Animated.Value(1)).current;
  const scaleChallenge = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(slideRutinas, { toValue: 0, useNativeDriver: true }),
      Animated.spring(slideAlimentacion, { toValue: 0, useNativeDriver: true }),
      Animated.spring(slideChallenge, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateIn = (scale) => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const animateOut = (scale) => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Image source={require('../assets/avatar.png')} style={styles.avatar} />
        <Text style={styles.greeting}>¡Hola, {userName}!</Text>
        <Text style={styles.subtitle}>{message}</Text>
        <View style={styles.divider}>
          <Text style={styles.streakLabel}>Racha: {streakDays} días seguidos</Text>
        </View>
        <Pressable style={styles.startButton} onPress={() => navigation.navigate('Rutinas')}>
          <Text style={styles.startButtonText}>Empezar rutina</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Rutinas')}
        onPressIn={() => animateIn(scaleRutinas)}
        onPressOut={() => animateOut(scaleRutinas)}
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleRutinas }, { translateY: slideRutinas }] },
          ]}
        >
          <Text style={styles.cardTitle}>Rutinas de hoy ➔</Text>
          <Text style={styles.cardDescription}>Última rutina: {lastRoutine}</Text>
        </Animated.View>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('Alimentacion')}
        onPressIn={() => animateIn(scaleAlimentacion)}
        onPressOut={() => animateOut(scaleAlimentacion)}
      >
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAlimentacion }, { translateY: slideAlimentacion }] },
          ]}
        >
          <Text style={styles.cardTitle}>Alimentación recomendada ➔</Text>
          <Text style={styles.cardDescription}>Última comida: {lastMeal}</Text>
        </Animated.View>
      </Pressable>



      {showChallenge && (
        <Animated.View
          style={[
            styles.card,
            styles.challengeCard,
            { transform: [{ scale: scaleChallenge }, { translateY: slideChallenge }] },
          ]}
        >
          <DailyChallenge />
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f4f4',
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#111',
  },
  header: {
    width: '100%',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    marginTop: 10,
  },
  streakLabel: {
    fontSize: 16,
    color: '#ef2b2d',
    fontWeight: '600',
  },
  startButton: {
    marginTop: 15,
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
  },
  challengeCard: {
    backgroundColor: '#ffe8e8',
    borderLeftWidth: 5,
    borderLeftColor: '#ef2b2d',
  },
  challengeButton: {
    marginBottom: 20,
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  challengeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});