// WelcomeScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Image,
  useColorScheme,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';


const PRIMARY = '#ef2b2d';

const lightTheme = {
  bg: '#f4f4f4',
  primary: PRIMARY,
  card: '#ffffff',
  title: '#333333',
  subtle: '#666666',
  hairline: '#cccccc',
  challengeBg: ['#ffe8e8', '#e8fff1', '#e8f0ff', '#fff4e8']
};



const ROUTINE_CARD_TEXT = {
  title: 'RUTINAS DE HOY',
  last: 'Última rutina: Piernas y abdomen',
};

const MEAL_CARD_TEXT = {
  title: 'ALIMENTACIÓN RECOMENDADA',
  last: 'Última comida: Pollo frito',
};

const CHALLENGES = [
  { id: 'c1', title: 'Reto HIIT 5 min', subtitle: '30s on / 15s off × 6', colorIdx: 0 },
  { id: 'c2', title: 'Reto Flexiones 50', subtitle: '5 series de 10 reps', colorIdx: 1 },
  { id: 'c3', title: 'Reto Core', subtitle: '1 min plancha × 3', colorIdx: 2 },
  { id: 'c4', title: 'Reto Hidratación', subtitle: '8 vasos de agua hoy', colorIdx: 3 },

];


function ChallengeCard({ item, theme, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const animateOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3, tension: 40 }).start();

  const bg = theme.challengeBg[item.colorIdx % theme.challengeBg.length];

  return (
    <Pressable onPressIn={animateIn} onPressOut={animateOut} onPress={() => onPress?.(item.id)}>
      <Animated.View style={[styles.challengeCard, { backgroundColor: bg, transform: [{ scale }] }]}>
        <View style={styles.challengeHeader}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.challengeTitle, { color: theme.title }]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={[styles.challengeSubtitle, { color: theme.subtle }]} numberOfLines={2}>
          {item.subtitle}
        </Text>

        <View style={[styles.cta, { backgroundColor: theme.primary }]}>
          <Text style={styles.ctaText}>Empezar</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}


export default function WelcomeScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;


  const userName = 'Sergi';
  const streakDays = 12;

  const messages = useMemo(
    () => [
      '¡Sigue así, estás logrando grandes cosas!',
      'Cada día cuenta, ¡no te detengas!',
      'Tu constancia es tu mejor herramienta.',
      '¡Hoy es un gran día para superarte!',
    ],
    []
  );
  const [message] = useState(messages[Math.floor(Math.random() * messages.length)]);


  const mountOpacity = useRef(new Animated.Value(0)).current;
  const mountTranslate = useRef(new Animated.Value(24)).current;
  const scaleHeaderCTA = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(mountTranslate, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateIn = (scale) =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  const animateOut = (scale) =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3, tension: 40 }).start();


  const handleStartChallenge = (id) => {

    navigation.navigate('Rutinas');
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />


      <Animated.View
        style={[
          styles.header,
          { borderBottomColor: theme.hairline, transform: [{ translateY: mountTranslate }], opacity: mountOpacity },
        ]}
      >
        <Image source={require('../assets/avatar.png')} style={styles.avatar} />
        <Text style={[styles.greeting, { color: theme.primary }]}>¡Hola, {userName}!</Text>
        <Text style={[styles.subtitle, { color: theme.subtle }]}>{message}</Text>

        <View style={[styles.streakChip, { borderColor: theme.primary, backgroundColor: theme.card }]}>
          <Text style={[styles.streakChipText, { color: theme.primary }]}>  Racha: {streakDays} días seguidos</Text>
        </View>


        <Pressable
          onPressIn={() => animateIn(scaleHeaderCTA)}
          onPressOut={() => animateOut(scaleHeaderCTA)}
          onPress={() => navigation.navigate('Rutinas')}
          accessibilityRole="button"
          accessibilityLabel="Empezar rutina"
        >
          <Animated.View
            style={[
              styles.startButton,
              {
                backgroundColor: theme.primary,
                shadowColor: '#000',
                transform: [{ scale: scaleHeaderCTA }],
              },
            ]}
          >
            <Text style={styles.startButtonText}>Empezar rutina</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>


      <Pressable onPress={() => navigation.navigate('Rutinas')}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: isDark ? 'transparent' : '#000',
              transform: [{ translateY: mountTranslate }],
              opacity: mountOpacity,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.title }]}>{ROUTINE_CARD_TEXT.title} </Text>
          <Text style={[styles.cardDescription, { color: theme.subtle }]}>{ROUTINE_CARD_TEXT.last}</Text>
        </Animated.View>
      </Pressable>


      <Pressable onPress={() => navigation.navigate('Alimentacion')}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: isDark ? 'transparent' : '#000',
              transform: [{ translateY: mountTranslate }],
              opacity: mountOpacity,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.title }]}>{MEAL_CARD_TEXT.title}</Text>
          <Text style={[styles.cardDescription, { color: theme.subtle }]}>{MEAL_CARD_TEXT.last}</Text>
        </Animated.View>
      </Pressable>


      <View style={{ marginTop: 16 }}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.title }]}>Retos diarios</Text>
          <Text style={[styles.sectionLink, { color: theme.primary }]}>Desliza para ver más ➔</Text>
        </View>

        <FlatList
          data={CHALLENGES}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <ChallengeCard item={item} theme={theme} onPress={handleStartChallenge} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          decelerationRate="fast"
          snapToInterval={260 + 12}
          snapToAlignment="start"
          getItemLayout={(_, index) => ({
            length: 260 + 12,
            offset: (260 + 12) * index,
            index,
          })}
        />
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 14,
    textAlign: 'center',
  },
  streakChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
  },
  streakChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  startButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
    elevation: 2,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  card: {
    borderRadius: 14,
    padding: 22,
    marginTop: 12,
    marginHorizontal: 16,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '500',
  },

  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionLink: { fontSize: 12, fontWeight: '800' },


  challengeCard: {
    width: 260,
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10},
  challengeTitle: { fontSize: 18, fontWeight: '800' },
  challengeSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 14 },
  cta: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});