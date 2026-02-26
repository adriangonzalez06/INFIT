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
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import colors from './colors';
const { width } = Dimensions.get('window');
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
    title: 'Hidratación',
    description: 'Bebe 2L de agua para mantenerte al 100%.',
    icon: 'water',
    points: 10,
    color: '#007AFF',
  },
  {
    id: 'pasos',
    title: 'Caminata Diaria',
    description: 'Camina 8.000 pasos para activar tu corazón.',
    icon: 'walk',
    points: 15,
    color: '#FF9500',
  },
  {
    id: 'estiramientos',
    title: 'Movilidad',
    description: '5 minutos de estiramientos revitalizantes.',
    icon: 'fitness',
    points: 10,
    color: '#5856D6',
  },
];

const WEEKLY_CHALLENGES = [
  {
    id: 'sesiones',
    title: 'Guerrero Semanal',
    description: 'Completa 4 sesiones de entrenamiento.',
    icon: 'barbell',
    points: 50,
    target: 4,
    color: '#ef2b2d',
  },
  {
    id: 'recetas-saludables',
    title: 'Chef Saludable',
    description: 'Registra 5 comidas nutritivas.',
    icon: 'restaurant',
    points: 40,
    target: 5,
    color: '#4CD964',
  },
  {
    id: 'descanso',
    title: 'Recuperación',
    description: 'Duerme 7h al menos 3 días esta semana.',
    icon: 'moon',
    points: 30,
    target: 3,
    color: '#34C759',
  },
];

/* -----------------------------
   Claves de almacenamiento
------------------------------ */

const STORAGE_KEYS = {
  daily: (key) => `challenges_daily_${key}`,
  weekly: (key) => `challenges_weekly_${key}`,
};

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

const ProgressBar = ({ progress = 0, color = '#ef2b2d', height = 8, isDark = false }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.max(0, Math.min(1, progress)),
      useNativeDriver: false,
      tension: 20,
      friction: 7,
    }).start();
  }, [progress]);

  const widthRaw = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressContainer, { height }, isDark && styles.progressContainerDark]}>
      <Animated.View style={[styles.progressFill, { width: widthRaw, backgroundColor: color }]} />
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

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('darkMode').then(val => setIsDark(val === 'true'));
    }, [])
  );

  const [activeTab, setActiveTab] = useState('Diarios');

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

  /* -------- Listado -------- */

  const data = activeTab === 'Diarios' ? DAILY_CHALLENGES : WEEKLY_CHALLENGES;

  /* -------- Render de tarjetas -------- */

  /* -------- Render de tarjetas -------- */

  const renderDailyItem = ({ item }) => {
    const completed = !!dailyState[item.id];
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={styles.cardMain}>
          <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.cardTextContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.cardTitle, isDark && styles.textDark]}>{item.title}</Text>
              <View style={[styles.pointsBadge, isDark && styles.darkPointsBadge]}>
                <Text style={styles.pointsText}>+{item.points} XP</Text>
              </View>
            </View>
            <Text style={[styles.cardDesc, isDark && styles.textDarkSecondary]}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={() => toggleDaily(item.id)}
            activeOpacity={0.7}
            style={[
              styles.actionBtn,
              completed ? styles.btnSuccess : styles.btnOutline,
            ]}
          >
            {completed && <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />}
            <Text style={[styles.actionBtnText, completed && styles.textWhite]}>
              {completed ? 'Completado' : 'Marcar progreso'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWeeklyItem = ({ item }) => {
    const current = weeklyState[item.id] ?? 0;
    const isCompleted = current >= item.target;
    const pct = Math.min(1, current / item.target);

    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={styles.cardMain}>
          <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.cardTextContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.cardTitle, isDark && styles.textDark]}>{item.title}</Text>
              <View style={[styles.pointsBadge, isDark && styles.darkPointsBadge]}>
                <Text style={styles.pointsText}>+{item.points} XP</Text>
              </View>
            </View>
            <Text style={[styles.cardDesc, isDark && styles.textDarkSecondary]}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressCount, isDark && styles.textDark]}>{current} / {item.target}</Text>
            <Text style={[styles.progressPercent, isDark && styles.textDarkSecondary]}>{Math.round(pct * 100)}%</Text>
          </View>
          <ProgressBar progress={pct} color={item.color} height={6} isDark={isDark} />
        </View>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            onPress={() => incrementWeekly(item.id, -1)}
            style={[styles.miniBtn, isDark && styles.btnDark]}
          >
            <Ionicons name="remove" size={20} color={isDark ? "#fff" : "#333"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => incrementWeekly(item.id, 1)}
            style={[styles.primaryActionBtn, isCompleted && styles.btnSuccess]}
          >
            <Text style={styles.textWhite}>{isCompleted ? '¡Logrado!' : 'Actualizar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => incrementWeekly(item.id, 1)}
            style={[styles.miniBtn, isDark && styles.btnDark]}
          >
            <Ionicons name="add" size={20} color={isDark ? "#fff" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* -------- Cabecera / Tabs / Filtros -------- */

  const headerMetrics = activeTab === 'Diarios' ? dailyMetrics : weeklyMetrics;

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.mainContainer, isDark && styles.mainContainerDark]}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, isDark && styles.backBtnDark]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? "#fff" : "#1a1a1a"} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={[styles.mainTitle, isDark && styles.textDark]}>Tus Logros</Text>
            <Text style={[styles.dateSub, isDark && styles.textDarkSecondary]}>
              {activeTab === 'Diarios' ? dailyKey : `Semana ${weekKeyState}`}
            </Text>
          </View>
          <TouchableOpacity style={[styles.profileBtn, isDark && styles.profileBtnDark]}>
            <Ionicons name="trophy" size={20} color="#ef2b2d" />
          </TouchableOpacity>
        </View>

        {/* Global Progress Card */}
        <View style={[styles.metricsCard, isDark && styles.cardDark]}>
          <View style={styles.metricsHeader}>
            <View>
              <Text style={[styles.metricsTitle, isDark && styles.textDark]}>Nivel de Actividad</Text>
              <Text style={[styles.metricsSub, isDark && styles.textDarkSecondary]}>
                {headerMetrics.done || headerMetrics.completed} de {headerMetrics.total} completados
              </Text>
            </View>
            <View style={styles.xpBox}>
              <Text style={styles.xpValue}>{headerMetrics.pointsEarned}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
          <View style={styles.progressWrapper}>
            <ProgressBar progress={headerMetrics.progress} color="#ef2b2d" height={10} isDark={isDark} />
            <View style={styles.progressLabels}>
              <Text style={styles.progressSideLabel}>0%</Text>
              <Text style={styles.progressSideLabel}>100%</Text>
            </View>
          </View>
        </View>

        {/* Tabs Control */}
        <View style={[styles.tabBar, isDark && styles.tabBarDark]}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab(t);
              }}
              style={[
                styles.tabItem,
                activeTab === t && styles.tabItemActive,
              ]}
            >
              <Text style={[
                styles.tabItemText,
                isDark && styles.textDark,
                activeTab === t && styles.tabItemTextActive
              ]}>
                {t}
              </Text>
              {activeTab === t && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* List Section */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'Diarios' ? renderDailyItem : renderWeeklyItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="ribbon-outline" size={60} color={isDark ? "#333" : "#ddd"} />
              <Text style={[styles.emptyText, isDark && styles.textDarkSecondary]}>
                No hay retos en esta sección
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  safeDark: { backgroundColor: colors.bg_dark },
  mainContainer: { flex: 1, backgroundColor: colors.white },
  mainContainerDark: { backgroundColor: colors.bg_dark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 50,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtnDark: { backgroundColor: '#3a3a3a' },
  headerTitles: { alignItems: 'center' },
  mainTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  dateSub: { fontSize: 13, color: '#888', fontWeight: '600', marginTop: 2 },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileBtnDark: { backgroundColor: '#3a3a3a' },

  metricsCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  metricsTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  metricsSub: { fontSize: 13, color: '#888', fontWeight: '600', marginTop: 4 },
  xpBox: {
    backgroundColor: '#ef2b2d',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpValue: { color: '#fff', fontSize: 17, fontWeight: '900' },
  xpLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  progressWrapper: { gap: 8 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSideLabel: { fontSize: 11, color: '#bbb', fontWeight: '700' },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabBarDark: { backgroundColor: '#3a3a3a' },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
    position: 'relative',
  },
  tabItemActive: { backgroundColor: 'transparent' },
  tabItemText: { fontSize: 14, fontWeight: '700', color: '#888' },
  tabItemTextActive: { color: '#ef2b2d' },
  tabIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 20,
    height: 3,
    backgroundColor: '#ef2b2d',
    borderRadius: 2,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  cardDark: { backgroundColor: '#474747ff', elevation: 0 },
  cardMain: { flexDirection: 'row', gap: 16 },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  cardDesc: { fontSize: 13, color: '#888', lineHeight: 18, fontWeight: '500' },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 43, 45, 0.08)',
  },
  darkPointsBadge: { backgroundColor: 'rgba(239, 43, 45, 0.15)' },
  pointsText: { fontSize: 11, color: '#ef2b2d', fontWeight: '800' },

  cardFooter: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#ef2b2d20',
    backgroundColor: '#ef2b2d05',
  },
  btnSuccess: { backgroundColor: '#34C759' },
  btnDark: { backgroundColor: '#333' },
  actionBtnText: { fontSize: 13, fontWeight: '800', color: '#ef2b2d' },
  textWhite: { color: '#fff', fontWeight: '800' },

  progressSection: { marginTop: 18, gap: 10 },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressCount: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  progressPercent: { fontSize: 14, fontWeight: '700', color: '#888' },

  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  miniBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ef2b2d',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 15 },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '600' },

  progressContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressContainerDark: {
    backgroundColor: '#3a3a3a',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  textDarkSecondary: { color: '#fff' },
  textDark: { color: '#fff' },
});


