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
  bg: '#f8f9fa',
  primary: PRIMARY,
  card: '#ffffff',
  title: '#1a1a1a',
  subtle: '#666666',
  hairline: '#eeeeee',
  challengeBg: ['#fff0f0', '#f0fff4', '#f0f4ff', '#fffcf0'],
  cardShadow: 'rgba(0,0,0,0.08)'
};

const darkTheme = {
  bg: '#0f0f0f',
  primary: '#ef2b2d',
  card: '#1a1a1a',
  title: '#ffffff',
  subtle: '#aaaaaa',
  hairline: '#2a2a2a',
  challengeBg: ['#251515', '#152518', '#151825', '#252115'],
  cardShadow: 'rgba(0,0,0,0.3)'
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
  const [userAvatar, setUserAvatar] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let name = (user.displayName && user.displayName.trim()) || null;
        let streakVal = 0;

        // Cargar desde AsyncStorage primero (rápido)
        try {
          const savedStreak = await AsyncStorage.getItem('streak');
          const savedName = await AsyncStorage.getItem('userName');
          const savedAvatar = await AsyncStorage.getItem('userAvatar');
          if (savedStreak) setStreak(Number(savedStreak));
          if (savedName) setUserName(savedName);
          if (savedAvatar) setUserAvatar({ uri: savedAvatar });
        } catch (e) {
          console.warn('Error cargando de AsyncStorage:', e?.message);
        }

        // Si no hay displayName en Firebase, intentar obtener del backend
        try {
          const resp = await axios.get(
            `${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(user.email)}`,
            { timeout: 5000 }
          );
          if (resp.data) {
            const { nombre, streak: bkStreak, photoURL } = resp.data;
            if (nombre) {
              name = nombre;
              await AsyncStorage.setItem('userName', nombre);
            }
            if (bkStreak !== undefined) {
              streakVal = bkStreak;
              await AsyncStorage.setItem('streak', bkStreak.toString());
            }
            if (photoURL) {
              setUserAvatar({ uri: photoURL });
              await AsyncStorage.setItem('userAvatar', photoURL);
            }
          }
        } catch (e) {
          console.warn('No se pudo obtener datos del backend:', e?.message || e);
        }

        setUserName(name || user.displayName || user.email.split('@')[0]);
        setStreak(streakVal);
      } else {
        setUserName(null);
        setUserAvatar(null);
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
      <StatusBar hidden={false} barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Header Seccion ── */}
      <Animated.View style={[styles.header, { opacity: mountOpacity, transform: [{ translateY: mountTranslate }] }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.title }]}>
              ¡Hola, {userName || 'atleta'}! 👋
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>{message}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
            <Image
              source={userAvatar || require('../assets/avatar.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.streakChip, { borderColor: theme.hairline, backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
          <Ionicons name="flame" size={20} color={theme.primary} />
          <Text style={[styles.streakChipText, { color: theme.title }]}>
            {streak} Días de racha
          </Text>
        </View>
      </Animated.View>

      <View style={styles.cardsRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Rutinas')}
          style={[styles.smallCard, { backgroundColor: theme.card, shadowColor: theme.cardShadow }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#fff0f0' }]}>
            <Ionicons name="barbell" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: theme.title }]}>Rutinas</Text>
          <Text style={[styles.cardDescription, { color: theme.subtle }]} numberOfLines={1}>
            Sigue entrenando
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Alimentacion')}
          style={[styles.smallCard, { backgroundColor: theme.card, shadowColor: theme.cardShadow }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="restaurant" size={24} color="#3b82f6" />
          </View>
          <Text style={[styles.cardTitle, { color: theme.title }]}>Comidas</Text>
          <Text style={[styles.cardDescription, { color: theme.subtle }]} numberOfLines={1}>
            Cuida tu dieta
          </Text>
        </TouchableOpacity>
      </View>


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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ef2b2d',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  streakChipText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  smallCard: {
    flex: 0.48,
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  challengeCard: {
    width: 240,
    borderRadius: 24,
    padding: 20,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  challengeSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 16,
  },
  cta: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
});
