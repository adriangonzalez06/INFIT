
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  LayoutAnimation,
  UIManager,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
// Habilitar LayoutAnimation en Android
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* -----------------------------
   Datos de ejemplo
------------------------------ */

const DAILY_CHALLENGES = [
  {
    id: 'agua',
    title: 'Bebe 2L de agua',
    description: 'Mantente hidratado durante el día.',
    icon: '',
    points: 10,
  },
  {
    id: 'pasos',
    title: 'Camina 8.000 pasos',
    description: 'Suma actividad moderada a tu día.',
    icon: '️',
    points: 15,
  },
  {
    id: 'estiramientos',
    title: '5 minutos de estiramientos',
    description: 'Mejora movilidad y previene lesiones.',
    icon: '',
    points: 10,
  },
];

const WEEKLY_CHALLENGES = [
  {
    id: 'sesiones',
    title: 'Completa 4 sesiones de ejercicio',
    description: 'Cualquier rutina marcada como completada cuenta.',
    icon: '',
    points: 50,
    target: 4, // progreso incremental
  },
  {
    id: 'recetas-saludables',
    title: 'Registra 5 comidas saludables',
    description: 'Añade platos con frutas, verduras o proteína magra.',
    icon: '',
    points: 40,
    target: 5,
  },
  {
    id: 'descanso',
    title: 'Duerme 7h al menos 3 días',
    description: 'Cuida tu recuperación durante la semana.',
    icon: '',
    points: 30,
    target: 3,
  },
];

/* -----------------------------
   Helpers de fecha / claves
------------------------------ */

const todayKey = () => new Date().toISOString().slice(0, 10);

// Semana empezando lunes: usamos la fecha del lunes como "clave"
const weekKey = () => {
  const d = new Date();
  const day = d.getDay(); // 0=domingo, 1=lunes...
  const diffToMonday = (day + 6) % 7; // 0 si lunes, 6 si domingo
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${y}`; // clave única para esa semana
};

const ProgressBar = ({ progress = 0, color = '#4CAF50', height = 10 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressContainer, { height }]}>
      <Animated.View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
};

/* -----------------------------
   Pantalla principal
------------------------------ */

const FILTERS = ['Todos', 'Pendientes', 'Completados'];
const TABS = ['Diarios', 'Semanales', 'Mensuales'];

export default function ChallengesScreen() {
  const navigation = useNavigation();
  const [isDark, setIsDark] = useState(false);

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

  const [activeTab, setActiveTab] = useState('Diarios');
  const [filter, setFilter] = useState('Todos');

  // Estado diario: { id: boolean }
  const [dailyState, setDailyState] = useState({});
  const [dailyKey, setDailyKey] = useState(todayKey());

  // Estado semanal: { id: number } progreso actual
  const [weeklyState, setWeeklyState] = useState({});
  const [weekKeyState, setWeekKeyState] = useState(weekKey());

  // Cargar estado al montar
  useEffect(() => {
    const load = async () => {
      const dKey = todayKey();
      const wKey = weekKey();
      setDailyKey(dKey);
      setWeekKeyState(wKey);

      const [dJson, wJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.daily(dKey)),
        AsyncStorage.getItem(STORAGE_KEYS.weekly(wKey)),
      ]);


    };
    load();
  }, []);

  // Si cambia el día/semana (por ejemplo, app abierta a medianoche), reseteamos claves
  useEffect(() => {
    const interval = setInterval(async () => {
      const newD = todayKey();
      const newW = weekKey();
      if (newD !== dailyKey) {
        setDailyKey(newD);
        setDailyState({});
        await AsyncStorage.setItem(STORAGE_KEYS.daily(newD), JSON.stringify({}));
      }
      if (newW !== weekKeyState) {
        setWeekKeyState(newW);
        setWeeklyState({});
        await AsyncStorage.setItem(STORAGE_KEYS.weekly(newW), JSON.stringify({}));
      }
    }, 60 * 1000); // chequeo cada minuto
    return () => clearInterval(interval);
  }, [dailyKey, weekKeyState]);

  /* -------- Mutadores -------- */


  //video youtube
  const toggleDaily = async (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = { ...dailyState, [id]: !dailyState[id] };
    setDailyState(next);
    await AsyncStorage.setItem(STORAGE_KEYS.daily(dailyKey), JSON.stringify(next));
  };

  //video youtube
  const incrementWeekly = async (id, delta) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const target = WEEKLY_CHALLENGES.find((c) => c.id === id)?.target ?? 1;
    const current = weeklyState[id] ?? 0;
    const nextVal = Math.max(0, Math.min(target, current + delta));
    const next = { ...weeklyState, [id]: nextVal };
    setWeeklyState(next);
    await AsyncStorage.setItem(STORAGE_KEYS.weekly(weekKeyState), JSON.stringify(next));
  };

  //video youtube


  const dailyMetrics = useMemo(() => {
    const total = DAILY_CHALLENGES.length;
    const done = DAILY_CHALLENGES.filter((c) => dailyState[c.id]).length;
    return {
      total,
      done,
      progress: total > 0 ? done / total : 0,
      pointsEarned: DAILY_CHALLENGES.reduce(
        (acc, c) => acc + (dailyState[c.id] ? c.points : 0),
        0
      ),
      pointsTotal: DAILY_CHALLENGES.reduce((acc, c) => acc + c.points, 0),
    };
  }, [dailyState]);

  const weeklyMetrics = useMemo(() => {
    const totals = WEEKLY_CHALLENGES.map((c) => c.target);
    const progresses = WEEKLY_CHALLENGES.map((c) => Math.min(c.target, weeklyState[c.id] ?? 0));
    const totalSteps = totals.reduce((a, b) => a + b, 0);
    const doneSteps = progresses.reduce((a, b) => a + b, 0);
    const completed = WEEKLY_CHALLENGES.filter((c) => (weeklyState[c.id] ?? 0) >= c.target).length;
    const pointsEarned = WEEKLY_CHALLENGES.reduce(
      (acc, c) => acc + ((weeklyState[c.id] ?? 0) >= c.target ? c.points : 0),
      0
    );

    const pointsTotal = WEEKLY_CHALLENGES.reduce((acc, c) => acc + c.points, 0);
    return {
      total: WEEKLY_CHALLENGES.length,
      completed,
      progress: totalSteps > 0 ? doneSteps / totalSteps : 0,
      pointsEarned,
      pointsTotal,
    };
  }, [weeklyState]);

  /* -------- Filtros -------- */

  const filteredDaily = useMemo(() => {
    switch (filter) {
      case 'Pendientes':
        return DAILY_CHALLENGES.filter((c) => !dailyState[c.id]);
      case 'Completados':
        return DAILY_CHALLENGES.filter((c) => !!dailyState[c.id]);
      default:
        return DAILY_CHALLENGES;
    }
  }, [filter, dailyState]);

  const filteredWeekly = useMemo(() => {
    switch (filter) {
      case 'Pendientes':
        return WEEKLY_CHALLENGES.filter((c) => (weeklyState[c.id] ?? 0) < c.target);
      case 'Completados':
        return WEEKLY_CHALLENGES.filter((c) => (weeklyState[c.id] ?? 0) >= c.target);
      default:
        return WEEKLY_CHALLENGES;
    }
  }, [filter, weeklyState]);

  /* -------- Render de tarjetas -------- */

  const renderDailyItem = ({ item }) => {
    const completed = !!dailyState[item.id];
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>

        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.cardTitle, isDark && styles.textDark]}>{item.title}</Text>
          <View style={[styles.pointsBadge, isDark && styles.darkPointsBadge]}>
            <Text style={styles.pointsText}>+{item.points} XP</Text>
          </View>
        </View>


        <Text style={[styles.cardDesc, isDark && styles.textDark]}>{item.description}</Text>

        <View style={styles.cardActions}>
          <Pressable
            onPress={() => toggleDaily(item.id)}
            style={({ pressed }) => [
              styles.primaryBtn,
              completed && styles.primaryBtnDone,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>{completed ? 'Completado' : 'Marcar como hecho'}</Text>
          </Pressable>

          <Text style={[styles.statusText, completed ? styles.statusDone : styles.statusPending]}>
            {completed ? '✅' : '⏳'} {completed ? 'Listo' : 'Pendiente'}
          </Text>
        </View>
      </View>
    );
  };

  const renderWeeklyItem = ({ item }) => {
    const current = weeklyState[item.id] ?? 0;
    const pct = Math.min(1, current / item.target);

    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.cardTitle, isDark && styles.textDark]}>{item.title}</Text>
          <View style={[styles.pointsBadge, isDark && styles.darkPointsBadge]}>
            <Text style={styles.pointsText}>+{item.points} XP</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, isDark && styles.textDark]}>{item.description}</Text>

        <View style={styles.progressRow}>
          <ProgressBar progress={pct} color="#4CAF50" />
          <Text style={[styles.progressLabel, isDark && styles.textDark]}>
            {current} / {item.target}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <Pressable
            onPress={() => incrementWeekly(item.id, -1)}
            style={({ pressed }) => [styles.secondaryBtn, isDark && styles.darkSecondaryBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={[styles.secondaryBtnText, isDark && styles.darkSecondaryBtnText]}>−</Text>
          </Pressable>
          <Pressable
            onPress={() => incrementWeekly(item.id, +1)}
            style={({ pressed }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.98 }] }]}
          >
            <Text style={styles.primaryBtnText}>+ Progreso</Text>
          </Pressable>
        </View>

        <Text style={[styles.statusText, current >= item.target ? styles.statusDone : styles.statusPending]}>
          {current >= item.target ? '✅ Completado' : '⏳ En progreso'}
        </Text>
      </View>
    );
  };

  /* -------- Cabecera / Tabs / Filtros -------- */

  const headerMetrics = activeTab === 'Diarios' ? dailyMetrics : weeklyMetrics;

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]}>
      <View style={styles.container}>
        <Text style={styles.title}>Mis rutinas</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.textDark]}>Retos</Text>
        <Text style={[styles.subtitle, isDark && styles.textDark]}>
          {activeTab === 'Diarios'
            ? `Hoy (${dailyKey})`
            : `Semana desde lunes (${weekKeyState})`}
        </Text>


        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(t);
              }}
              style={[
                styles.tab,
                isDark && styles.tabDark,
                activeTab === t && styles.tabActive,
                activeTab === t && isDark && styles.tabActiveDark,
              ]}
            >
              <Text style={[styles.tabText, isDark && styles.textDark, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Métricas y progreso global */}
        <View style={[styles.metrics, isDark && styles.cardDark]}>
          <Text style={[styles.metricsText, isDark && styles.textDark]}>
            {activeTab === 'Diarios'
              ? `Completados: ${headerMetrics.done} / ${headerMetrics.total}`
              : `Retos completados: ${headerMetrics.completed} / ${headerMetrics.total}`}
          </Text>
          <ProgressBar progress={headerMetrics.progress} color="#4CAF50" height={12} />
          <Text style={[styles.metricsTextSmall, isDark && styles.textDark]}>
            XP: {headerMetrics.pointsEarned} / {headerMetrics.pointsTotal}
          </Text>
        </View>

        {/* Listado */}
        <FlatList
          data={activeTab === 'Diarios' ? filteredDaily : filteredWeekly}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'Diarios' ? renderDailyItem : renderWeeklyItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  safeDark: { backgroundColor: '#111' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#222' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 10 },

  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    borderColor: '#DDD', alignItems: 'center', backgroundColor: '#FFF',
  },
  tabActive: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  tabActiveDark: { backgroundColor: '#1b3b20', borderColor: '#4CAF50' },
  tabDark: { backgroundColor: '#1e1e1e', borderColor: '#333' },
  tabText: { fontSize: 14, color: '#555', fontWeight: '600' },
  tabTextActive: { color: '#2E7D32' },

  metrics: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 12,
    elevation: 3,
  },
  metricsText: { fontSize: 16, color: '#333', marginBottom: 6, fontWeight: '600' },
  metricsTextSmall: { fontSize: 13, color: '#555', marginTop: 8 },

  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF',
  },
  filterPillActive: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  filterText: { fontSize: 13, color: '#555', fontWeight: '600' },
  filterTextActive: { color: '#2E7D32' },

  card: {
    backgroundColor: '#E0E0E0', borderRadius: 14, padding: 12, marginBottom: 12,
    elevation:
      0,
  },
  cardDark: { backgroundColor: '#1A1A1A' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 26 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 6 },

  pointsBadge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFE0B2',
  },
  darkPointsBadge: {
    backgroundColor: '#2d1b00',
    borderColor: '#4d3b10',
  },
  pointsText: { fontSize: 12, color: '#FB8C00', fontWeight: '700' },

  cardActions: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10,
    justifyContent: 'space-between',
  },

  primaryBtn: {
    flex: 1, backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnDone: { backgroundColor: '#7CB342' },
  primaryBtnText: { color: '#FFF', fontWeight: '800' },

  secondaryBtn: {
    width: 44, height: 44, borderRadius: 10, backgroundColor: '#EEE',
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 20, fontWeight: '800', color: '#333' },
  darkSecondaryBtn: { backgroundColor: '#333' },
  darkSecondaryBtnText: { color: '#eee' },

  statusText: { marginTop: 8, fontSize: 13, fontWeight: '700' },
  statusDone: { color: '#2E7D32' },
  statusPending: { color: '#8D6E63' },

  progressContainer: {
    width: '100%', backgroundColor: '#E0E0E0', borderRadius: 999, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 999,
  },

  progressRow: { marginTop: 10, gap: 6 },
  progressLabel: { fontSize: 12, color: '#555', alignSelf: 'flex-end' },

  textDark: { color: '#EEE' },


  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 20,
    textAlign: 'center',
  }
}

);


