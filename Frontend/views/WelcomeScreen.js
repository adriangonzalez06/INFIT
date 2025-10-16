import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const userName = 'Sergi';
  const streakDays = 12;

  const slideRutinas = useRef(new Animated.Value(100)).current;
  const slideAlimentacion = useRef(new Animated.Value(100)).current;
  const scaleRutinas = useRef(new Animated.Value(1)).current;
  const scaleAlimentacion = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(slideRutinas, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(slideAlimentacion, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateIn = (scale) => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {userName}!</Text>
        <Text style={styles.subtitle}>Hoy es un gran día para entrenar</Text>
        <View style={styles.divider}>
          <Text style={styles.streakLabel}>Racha: {streakDays} días seguidos</Text>
        </View>
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
          <Text style={styles.cardDescription}>
            Descubre tus ejercicios diarios y sigue tu progreso
          </Text>
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
          <Text style={styles.cardDescription}>
            Consulta tus comidas ideales para hoy
          </Text>
        </Animated.View>
      </Pressable>
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
  header: {
    width: '100%',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    marginBottom: 20,
    textAlign: 'center',
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
});