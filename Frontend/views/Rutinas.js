import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform, SafeAreaView, useColorScheme
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../src/components/Header';
import { StatusBar } from 'expo-status-bar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { BACKEND_URL } from '../src/config';
import colors from './colors';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AppModal from './AppModal';


const SUGERENCIAS = {
  piernas: ['Sentadillas', 'Zancadas', 'Peso muerto rumano'],
  espalda: ['Dominadas', 'Remo con barra', 'Peso muerto'],
  pecho: ['Press banca', 'Flexiones', 'Press inclinado'],
};

const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado'];

const PALETTE = ['#ef2b2d', '#2a9d8f', '#f4a261', '#5856D6', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

const rutinasPredefinidas = [
  {
    id: 'piernas',
    nombre: 'Piernas explosivas',
    ejercicios: [
      { id: 'p1', nombre: 'Sentadillas', series: '4', repeticiones: '12', peso: '60' },
      { id: 'p2', nombre: 'Zancadas', series: '3', repeticiones: '10', peso: '20' },
      { id: 'p3', nombre: 'Peso muerto rumano', series: '4', repeticiones: '10', peso: '50' },
      { id: 'p4', nombre: 'Prensa de piernas', series: '3', repeticiones: '15', peso: '100' },
      { id: 'p5', nombre: 'Extensión de cuádriceps', series: '3', repeticiones: '12', peso: '40' },
    ],
    dificultad: 'Intermedio',
    color: '#ef2b2d',
  },
  {
    id: 'espalda',
    nombre: 'Espalda fuerte',
    ejercicios: [
      { id: 'e1', nombre: 'Dominadas', series: '4', repeticiones: '8', peso: '0' },
      { id: 'e2', nombre: 'Remo con barra', series: '4', repeticiones: '10', peso: '40' },
      { id: 'e3', nombre: 'Peso muerto', series: '3', repeticiones: '8', peso: '80' },
      { id: 'e4', nombre: 'Jalón al pecho', series: '4', repeticiones: '12', peso: '50' },
      { id: 'e5', nombre: 'Remo en polea baja', series: '3', repeticiones: '12', peso: '45' },
    ],
    dificultad: 'Avanzado',
    color: '#2a9d8f',
  },
  {
    id: 'pecho',
    nombre: 'Pecho definido',
    ejercicios: [
      { id: 'c1', nombre: 'Press banca', series: '4', repeticiones: '10', peso: '60' },
      { id: 'c2', nombre: 'Flexiones', series: '3', repeticiones: '20', peso: '0' },
      { id: 'c3', nombre: 'Press inclinado', series: '4', repeticiones: '10', peso: '50' },
      { id: 'c4', nombre: 'Aperturas con mancuernas', series: '3', repeticiones: '12', peso: '15' },
      { id: 'c5', nombre: 'Fondos en paralelas', series: '3', repeticiones: '10', peso: '0' },
    ],
    dificultad: 'Principiante',
    color: '#f4a261',
  },
];

export default function Rutinas() {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState({ grupo1: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [nombreRutina, setNombreRutina] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [dificultad, setDificultad] = useState(null);
  const [userName, setUserName] = useState('');
  const [opcionesVisible, setOpcionesVisible] = useState(false);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [appModal, setAppModal] = useState({ visible: false, type: 'info', title: '', message: '' });
  const showAppModal = (type, title, message) => setAppModal({ visible: true, type, title, message });
  const hideAppModal = () => setAppModal(m => ({ ...m, visible: false }));

  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  // Cargar preferencia de tema
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        if (savedTheme !== null) {
          setDarkMode(savedTheme === "true");
        }
      } catch (e) {
        console.error("Error loading theme:", e);
      }
    };

    loadTheme();

    // Listener para actualizar cuando se vuelve a la pantalla
    const unsubscribe = navigation.addListener('focus', () => {
      loadTheme();
    });

    return unsubscribe;
  }, [navigation]);


  const predefinidas = rutinas.predefinidas || rutinasPredefinidas;

  useEffect(() => {
    // 1. Cargar rutinas de AsyncStorage
    const cargarRutinas = async () => {
      try {
        const data = await AsyncStorage.getItem('rutinas');
        if (data) {
          const parsed = JSON.parse(data);
          // Asegurar que existan las claves básicas
          setRutinas({
            grupo1: parsed.grupo1 || [],
            predefinidas: parsed.predefinidas || rutinasPredefinidas
          });
        } else {
          setRutinas({ grupo1: [], predefinidas: rutinasPredefinidas });
        }
      } catch (e) {
        console.error('Error cargando rutinas:', e);
      }
    };
    cargarRutinas();

    // 2. Cargar nombre de usuario (Quick cache + Firebase listener)
    const setupIdentidad = async () => {
      const cachedName = await AsyncStorage.getItem('userName');
      if (cachedName) setUserName(cachedName);

      const auth = getAuth();
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const resp = await axios.get(
              `${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(firebaseUser.email)}`,
              { timeout: 5000 }
            );
            if (resp.data && resp.data.nombre) {
              setUserName(resp.data.nombre);
              await AsyncStorage.setItem('userName', resp.data.nombre);
            } else {
              setUserName(firebaseUser.displayName || firebaseUser.email.split('@')[0]);
            }
          } catch (e) {
            console.warn('Error fetching backend user name in Rutinas:', e.message);
            setUserName(firebaseUser.displayName || firebaseUser.email.split('@')[0]);
          }
        }
      });
      return unsub;
    };

    let authUnsub;
    setupIdentidad().then(unsub => { authUnsub = unsub; });

    return () => {
      if (authUnsub) authUnsub();
    };
  }, []);

  // Recargar rutinas al volver de PantallaRutina
  useFocusEffect(
    useCallback(() => {
      const recargar = async () => {
        try {
          const data = await AsyncStorage.getItem('rutinas');
          if (data) {
            const parsed = JSON.parse(data);
            setRutinas({
              grupo1: parsed.grupo1 || [],
              predefinidas: parsed.predefinidas || rutinasPredefinidas,
            });
          }
        } catch (e) {
          console.warn('Error recargando rutinas:', e.message);
        }
      };
      recargar();
    }, [])
  );

  useEffect(() => {
    const palabraClave = Object.keys(SUGERENCIAS).find((clave) =>
      nombreRutina.toLowerCase().includes(clave)
    );
    setSugerencias(palabraClave ? SUGERENCIAS[palabraClave] : []);
  }, [nombreRutina]);

  const guardarEnStorage = async (nuevasRutinas) => {
    await AsyncStorage.setItem('rutinas', JSON.stringify(nuevasRutinas));
  };

  const handleAddRutina = (grupo) => {
    setGrupoActivo(grupo);
    setModalVisible(true);
  };

  const handleGuardarRutina = async () => {
    if (!nombreRutina.trim()) return;

    // Obtener userId guardado
    const userId = await AsyncStorage.getItem('userId');

    let firestoreId = null;

    // 1. Crear en Firestore si hay userId (para obtener un ID real)
    if (userId) {
      try {
        const resp = await axios.post(
          `${BACKEND_URL}/api/routines/${userId}`,
          { name: nombreRutina.trim(), exercises: [] },
          { timeout: 5000 }
        );
        firestoreId = resp.data?.id || null;
      } catch (e) {
        console.warn('No se pudo crear rutina en Firestore:', e.message);
      }
    }

    const nuevaRutina = {
      id: firestoreId || Date.now().toString(),
      nombre: nombreRutina.trim(),
      ejercicios: [],
      dificultad: dificultad || 'Sin definir',
      color: '#264653',
    };

    const nuevasRutinas = {
      ...rutinas,
      [grupoActivo]: [...(rutinas[grupoActivo] || []), nuevaRutina],
    };

    setRutinas(nuevasRutinas);
    await guardarEnStorage(nuevasRutinas);

    setNombreRutina('');
    setSugerencias([]);
    setDificultad(null);
    setModalVisible(false);
  };

  const handleEntrarRutina = async (rutina, grupoKey) => {
    try {
      // 1. Obtener rutinas recientes
      const recentData = await AsyncStorage.getItem('recentRoutines');
      let recentRoutines = recentData ? JSON.parse(recentData) : [];

      // 2. Filtrar si ya existe para evitar duplicados en la lista y ponerla de primera
      recentRoutines = recentRoutines.filter(r => r.id !== rutina.id);

      // 3. Añadir la rutina actual al principio con la fecha de apertura
      const rutinaToSave = {
        ...rutina,
        openedAt: new Date().toISOString()
      };
      recentRoutines.unshift(rutinaToSave);

      // 4. Mantener un máximo de 10 rutinas recientes
      if (recentRoutines.length > 10) {
        recentRoutines = recentRoutines.slice(0, 10);
      }

      // 5. Guardar en AsyncStorage
      await AsyncStorage.setItem('recentRoutines', JSON.stringify(recentRoutines));
    } catch (e) {
      console.warn('Error guardando en recentRoutines:', e);
    }

    navigation.navigate('PantallaRutina', {
      rutina,
      grupoKey,
      // No pasamos funciones como params (non-serializable)
      // PantallaRutina actualiza AsyncStorage directamente
    });
  };

  const handleLongPress = (rutina) => {
    setRutinaSeleccionada(rutina);
    setOpcionesVisible(true);
  };

  const handleEliminarRutina = async () => {
    const nuevasRutinas = {
      ...rutinas,
      grupo1: (rutinas.grupo1 || []).filter((r) => r.id !== rutinaSeleccionada.id),
    };
    setRutinas(nuevasRutinas);
    await guardarEnStorage(nuevasRutinas);
    setOpcionesVisible(false);
  };

  const handleDuplicarRutina = async () => {
    const copia = { ...rutinaSeleccionada, id: Date.now().toString() };
    const nuevasRutinas = {
      ...rutinas,
      grupo1: [...(rutinas.grupo1 || []), copia],
    };
    setRutinas(nuevasRutinas);
    await guardarEnStorage(nuevasRutinas);
    setOpcionesVisible(false);
  };

  const handleChangeColor = async (color) => {
    const nuevasRutinas = {
      ...rutinas,
      grupo1: (rutinas.grupo1 || []).map(r =>
        r.id === rutinaSeleccionada.id ? { ...r, color } : r
      ),
    };
    setRutinas(nuevasRutinas);
    await guardarEnStorage(nuevasRutinas);
    setRutinaSeleccionada({ ...rutinaSeleccionada, color });
  };

  const handlePublicarRutina = async () => {
    if (!rutinaSeleccionada) return;
    setOpcionesVisible(false);

    try {
      const userDocId = await AsyncStorage.getItem('userDocId');
      const email = await AsyncStorage.getItem('userEmail');
      let avatar = null;

      if (email) {
        try {
          const resp = await axios.get(`${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(email)}`);
          if (resp.data?.photo) avatar = resp.data.photo;
        } catch (e) {
          console.warn('Error fetching avatar for sharing routine:', e.message);
        }
      }

      await addDoc(collection(db, 'publicaciones'), {
        userId: userDocId || 'anon',
        username: userName || 'Usuario',
        avatarUrl: avatar || null,
        titulo: `He compartido mi rutina: ${rutinaSeleccionada.nombre}`,
        contenido: `¡Prueba esta rutina de nivel ${rutinaSeleccionada.dificultad}! Tiene ${rutinaSeleccionada.ejercicios.length} ejercicios.`,
        type: 'routine',
        routineData: rutinaSeleccionada,
        createdAt: serverTimestamp(),
        likes: [],
        likesCount: 0,
        comentariosCount: 0,
      });

      showAppModal('success', '¡Rutina publicada!', 'Tu rutina ya está en el feed para que otros puedan verla.');
    } catch (e) {
      console.error('Error al publicar rutina:', e);
      showAppModal('error', 'Error', 'No se pudo publicar la rutina.');
    }
  };

  const renderGrupo = (titulo, rutinasGrupo, grupoKey) => {
    return (
      <View style={styles.grupoContainer}>
        <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>{titulo}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.horizontalScrollContent, darkMode && { backgroundColor: colors.bg_dark }]}
          style={darkMode && { backgroundColor: colors.bg_dark }}
        >
          {(rutinasGrupo || []).map((rutina) => (
            <TouchableOpacity
              key={rutina.id}
              style={[styles.rutinaCard, darkMode && styles.darkCard, { backgroundColor: rutina.color || (darkMode ? '#1a1a1a' : '#ccc') }]}
              onPress={() => handleEntrarRutina(rutina, grupoKey)}
              onLongPress={() => handleLongPress(rutina)}
            >
              <Ionicons name="barbell" size={24} color="#fff" />
              <Text style={styles.rutinaTexto}>{rutina.nombre}</Text>
              <Text style={styles.rutinaSubTexto}>
                {(rutina.ejercicios || []).length} ejercicios
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.addCard, darkMode && styles.darkAddCard]}
            onPress={() => handleAddRutina(grupoKey)}
          >
            <Ionicons name="add" size={32} color={darkMode ? "#fff" : "#333"} />
            <Text style={[styles.addText, darkMode && styles.darkText]}>Nueva</Text>
          </TouchableOpacity>


        </ScrollView>
      </View>
    );
  };


  const renderPredefinidas = () => (
    <View style={styles.grupoContainer}>
      <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>Recomendadas para ti</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.horizontalScrollContent, darkMode && { backgroundColor: colors.bg_dark }]}
        style={darkMode && { backgroundColor: colors.bg_dark }}
      >
        {(predefinidas.length > 0 ? predefinidas : rutinasPredefinidas).map((rutina) => (
          <TouchableOpacity
            key={rutina.id}
            style={[styles.rutinaCard, darkMode && styles.darkCard, { backgroundColor: rutina.color || (darkMode ? '#1a1a1a' : '#ccc') }]}
            onPress={() => handleEntrarRutina(rutina, 'predefinidas')}
          >
            <Ionicons name="barbell" size={24} color="#fff" />
            <Text style={styles.rutinaTexto}>{rutina.nombre}</Text>
            <Text style={styles.rutinaSubTexto}>
              {rutina.ejercicios.length} ejercicios
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );

  const renderRetos = () => (
    <View style={styles.grupoContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>Retos Diarios</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Challenges')}>
          <Text style={styles.verTodosText}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <TouchableOpacity
          style={[styles.challengeCard, { backgroundColor: '#FF9500' }]}
          onPress={() => navigation.navigate('Challenges')}
        >
          <Ionicons name="water" size={28} color="#fff" />
          <Text style={styles.challengeTitle}>Hidratación</Text>
          <Text style={styles.challengeSubText}>2L de agua hoy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.challengeCard, { backgroundColor: '#4CD964' }]}
          onPress={() => navigation.navigate('Challenges')}
        >
          <Ionicons name="walk" size={28} color="#fff" />
          <Text style={styles.challengeTitle}>Actividad</Text>
          <Text style={styles.challengeSubText}>8.000 pasos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.challengeCard, { backgroundColor: '#5856D6' }]}
          onPress={() => navigation.navigate('Challenges')}
        >
          <Ionicons name="fitness" size={28} color="#fff" />
          <Text style={styles.challengeTitle}>Movilidad</Text>
          <Text style={styles.challengeSubText}>5 min estirar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <View style={[styles.header, darkMode && styles.darkHeader]}>

        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Rutinas INFIT</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: colors.bg_dark }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.greetingContainer, darkMode && { backgroundColor: colors.bg_dark }]}>
          <Text style={[styles.greetingText, darkMode && styles.darkText]}>Hola {userName || 'usuario'},</Text>
          <Text style={[styles.subGreetingText, darkMode && styles.darkTextSecondary]}>¿Listo para superar tus límites hoy?</Text>
        </View>

        {renderPredefinidas()}
        {renderRetos()}
        {renderGrupo('Mis rutinas personalizadas', rutinas.grupo1, 'grupo1')}
      </ScrollView>

      {/* Modal para crear rutina */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, darkMode && styles.darkModal]}
          >
            <View style={[styles.bottomSheetIndicator, darkMode && { backgroundColor: '#444' }]} />

            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Crear rutina</Text>
            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              placeholder="Ej. Piernas explosivas"
              placeholderTextColor={darkMode ? "#888" : "#999"}
              value={nombreRutina}
              onChangeText={setNombreRutina}
            />

            {sugerencias.length > 0 && (
              <View style={styles.sugerenciasContainer}>
                <Text style={[styles.sugerenciasTitulo, darkMode && styles.darkText]}>Ejercicios sugeridos:</Text>
                <View style={styles.chipsContainer}>
                  {sugerencias.map((ejercicio, index) => (
                    <View key={index} style={[styles.chip, darkMode && styles.darkChip]}>
                      <Text style={[styles.chipText, darkMode && styles.darkText]}>{ejercicio}</Text>
                    </View>
                  ))}
                </View>

              </View>
            )}
            <Text style={[styles.sugerenciasTitulo, darkMode && styles.darkText]}>Dificultad:</Text>
            <View style={styles.chipsContainer}>
              {DIFICULTADES.map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    styles.chip,
                    darkMode && styles.darkChip,
                    dificultad === nivel && styles.chipSelected,
                  ]}
                  onPress={() => setDificultad(nivel)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      darkMode && styles.darkText,
                      dificultad === nivel && styles.chipTextSelected,
                    ]}
                  >
                    {nivel}
                  </Text>
                </TouchableOpacity>

              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleGuardarRutina} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal de opciones (long press) */}
      <Modal visible={opcionesVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpcionesVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, darkMode && styles.darkModal]}
          >
            <View style={[styles.bottomSheetIndicator, darkMode && { backgroundColor: '#444' }]} />

            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Opciones de rutina</Text>

            <TouchableOpacity
              style={[styles.optionItem, darkMode && styles.darkOptionItem]}
              onPress={() => {
                if (rutinaSeleccionada) handleEntrarRutina(rutinaSeleccionada, 'grupo1');
                setOpcionesVisible(false);
              }}
            >
              <Ionicons name="create-outline" size={22} color={darkMode ? "#ccc" : "#333"} />
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333' }]}>Editar rutina</Text>
            </TouchableOpacity>


            <TouchableOpacity style={[styles.optionItem, darkMode && styles.darkOptionItem]} onPress={handleDuplicarRutina}>
              <Ionicons name="copy-outline" size={22} color={darkMode ? "#ccc" : "#333"} />
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333' }]}>Duplicar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionItem, darkMode && styles.darkOptionItem]} onPress={handlePublicarRutina}>
              <Ionicons name="share-social-outline" size={22} color={darkMode ? "#ccc" : "#333"} />
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333' }]}>Publicar en Feed</Text>
            </TouchableOpacity>


            <TouchableOpacity style={[styles.optionItem, darkMode && styles.darkOptionItem]} onPress={handleEliminarRutina}>
              <Ionicons name="trash-outline" size={22} color="#ef2b2d" />
              <Text style={[styles.modalButtonText, { color: '#ef2b2d' }]}>Eliminar</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sugerenciasTitulo, darkMode && styles.darkText, { marginBottom: 12 }]}>Personalizar color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 5 }}>
                {PALETTE.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => handleChangeColor(color)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: color,
                      borderWidth: rutinaSeleccionada?.color === color ? 3 : 0,
                      borderColor: darkMode ? '#fff' : '#333',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {rutinaSeleccionada?.color === color && (
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>


            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: darkMode ? '#333' : '#eee', marginTop: 20, flex: 0 }]}
              onPress={() => setOpcionesVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: darkMode ? '#888' : '#666' }]}>Cerrar</Text>

            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      <AppModal
        visible={appModal.visible}
        type={appModal.type}
        title={appModal.title}
        message={appModal.message}
        onConfirm={hideAppModal}
        darkMode={darkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: colors.bg_dark,
  },
  darkHeader: {
    backgroundColor: colors.bg_dark,
    borderBottomColor: '#333',
    borderTopColor: '#333',
  },



  greetingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subGreetingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {

    fontSize: 18,
    fontWeight: '700',
    color: colors.dark_gray || '#333',
  },
  grupoContainer: {
    marginBottom: 30,
  },
  grupoTitulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1a1a1a',
    paddingHorizontal: 20,
  },
  horizontalScrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 10,

  },
  rutinaCard: {
    width: 170,
    height: 190,
    borderRadius: 24,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 20,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  darkCard: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: '#1a1a1a',
  },
  rutinaTexto: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginTop: 10,
    lineHeight: 22,
  },
  rutinaSubTexto: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
  },
  addCard: {
    width: 170,
    height: 190,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    marginHorizontal: 8,
  },

  darkAddCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: '#444',
  },

  addText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginTop: 5,
  },
  bottomSheetIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sugerenciasContainer: {
    marginBottom: 10,
  },
  sugerenciasTitulo: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  darkChip: {
    borderColor: '#444',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  chipSelected: {
    backgroundColor: '#ef2b2d',
    borderColor: '#ef2b2d',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 14,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 15,
  },
  darkOptionItem: {
    borderBottomColor: '#333',
  },


  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 5,
  },
  verTodosText: {
    color: '#ef2b2d',
    fontWeight: '700',
    fontSize: 14,
  },
  challengeCard: {
    width: 140,
    height: 140,
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 5,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '800',
    marginTop: 8,
  },
  challengeSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  darkModal: {
    backgroundColor: colors.bg_dark,
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: colors.bg_dark,
    color: '#fff',
  },
  darkChip: {
    borderColor: '#444',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
