// WelcomeScreen.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../src/config';


const PRIMARY = '#ef2b2d';

const lightTheme = {
  bg: '#f4f4f4',
  primary: PRIMARY,
  card: '#ffffff',
  title: '#333333',
  subtle: '#666666',
  hairline: '#cccccc',
  challengeBg: ['#ffe8e8', '#e8fff1', '#e8f0ff', '#fff4e8'],
  cardShadow: '#000'
};

const darkTheme = {
  bg: '#121212',
  primary: '#ef2b2d',
  card: '#1e1e1e',
  title: '#ffffff',
  subtle: '#aaaaaa',
  hairline: '#222222',
  challengeBg: ['#2c1515', '#152c1d', '#151c2c', '#2c2215'],
  cardShadow: '#000'
};



const ROUTINE_CARD_TEXT = {
  title: 'RUTINAS DE HOY',
  last: 'Última rutina: Piernas y abdomen',
};

const MEAL_CARD_TEXT = {
  title: 'MI ALIMENTACIÓN',
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
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setIsDark(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  const [userName, setUserName] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let name = (user.displayName && user.displayName.trim()) || null;
        let streakVal = 0;

        // { changed code }} Cargar desde AsyncStorage primero (rápido)
        try {
          const savedStreak = await AsyncStorage.getItem('streak');
          if (savedStreak) {
            streakVal = Number(savedStreak);
          }
        } catch (e) {
          console.warn('Error cargando streak de AsyncStorage:', e?.message);
        }

        // Si no hay displayName en Firebase, intentar obtener del backend
        if (!name) {
          try {
            const resp = await axios.get(
              `${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(user.email)}`,
              { timeout: 5000 }
            );
            const nombreBackend = resp?.data?.nombre;
            streakVal = resp?.data?.streak || streakVal; // { changed code }} usa backend si existe, sino usa AsyncStorage
            if (nombreBackend) {
              name = nombreBackend;
              await AsyncStorage.setItem('userName', nombreBackend);
              await AsyncStorage.setItem('streak', streakVal.toString());
            }
          } catch (e) {
            console.warn('No se pudo obtener nombre del backend:', e?.message || e);
            // Aquí streakVal sigue siendo el valor de AsyncStorage
          }
        }

        setUserName(name || user.email || user.uid);
        setStreak(streakVal);
      } else {
        setUserName(null);
        setStreak(0);
      }
    });
    return () => unsub();
  }, []);

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
      <StatusBar hidden={true} />

      {/* ── Dumbbell banner ─────────────────────────────────────────── */}
      <ImageBackground
        source={require('../assets/images/dumbbell_header.png')}
        style={styles.dumbbellBanner}
        resizeMode="cover"
      >
        {/* Texto centrado entre las dos mancuernas */}
        <View style={styles.bannerTextWrap} pointerEvents="none">
          <Text style={styles.bannerText}>Rutinas</Text>
        </View>
      </ImageBackground>

      <Pressable onPress={() => navigation.navigate('Rutinas')}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: theme.cardShadow,
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
              shadowColor: theme.cardShadow,
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
          <Pressable onPress={() => navigation.navigate('Challenges')} ><Text style={[styles.sectionLink, { color: theme.primary }]}>Ver más ➔</Text></Pressable>
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
    paddingVertical: 0,
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
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  challengeTitle: { fontSize: 18, fontWeight: '800' },
  challengeSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 14 },
  cta: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // ── Dumbbell Banner ────────────────────────────────────────────────────────
  dumbbellBanner: {
    width: '100%',
    height: 160,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  // blobs izquierda
  blobLeft: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#264653',
    top: -40,
    left: -30,
    opacity: 0.92,
  },
  glowLeft: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e76f51',
    top: 10,
    left: 20,
    opacity: 0.55,
  },
  // blobs derecha
  blobRight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#264653',
    top: -20,
    right: -20,
    opacity: 0.92,
  },
  glowRight: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e76f51',
    top: 30,
    right: 20,
    opacity: 0.55,
  },
  // mancuernas
  dumbbellLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  dumbbellRight: {
    position: 'absolute',
    top: 8,
    right: 14,
  },
  // texto central
  bannerTextWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    right: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#264653',
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  headerImage: {
    top: '-5%'
  }
});
