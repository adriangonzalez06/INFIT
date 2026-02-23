import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../src/components/Header';
import { StatusBar } from 'expo-status-bar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { BACKEND_URL } from '../src/config';


const SUGERENCIAS = {
  piernas: ['Sentadillas', 'Zancadas', 'Peso muerto rumano'],
  espalda: ['Dominadas', 'Remo con barra', 'Peso muerto'],
  pecho: ['Press banca', 'Flexiones', 'Press inclinado'],
};

const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado'];

const rutinasPredefinidas = [
  {
    id: 'piernas',
    nombre: 'Piernas explosivas',
    ejercicios: [
      { id: 'p1', nombre: 'Sentadillas', series: '4', repeticiones: '12', peso: '60', animacion: require('../assets/ejercicios/sentadilla.json') },
      { id: 'p2', nombre: 'Zancadas', series: '3', repeticiones: '10', peso: '20', image: 'https://media.istockphoto.com/id/1310156903/photo/young-woman-doing-lunges-exercise-at-home.jpg?s=612x612&w=0&k=20&c=JCcun30_jK-9_I0E6-I6tUaM0V7QO8_l7v5Z1S_V8_M=' },
      { id: 'p3', nombre: 'Peso muerto rumano', series: '4', repeticiones: '10', peso: '50', image: 'https://images.squarespace-cdn.com/content/v1/594c3dcd37c58189856cc33b/1589139825444-2L3LXZO3M5ZG1Z3Z3V3Z/Romanian+Deadlift' },
      { id: 'p4', nombre: 'Prensa de piernas', series: '3', repeticiones: '15', peso: '100', image: 'https://www.verywellfit.com/thmb/Jz_vHwKk_lG5n2u0Y2G9X_4V-I8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/81-3120071-Leg-Press-GIF-669357e6005740348705009a259c7d81.gif' },
      { id: 'p5', nombre: 'Extensión de cuádriceps', series: '3', repeticiones: '12', peso: '40', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif' },
    ],
    dificultad: 'Intermedio',
    color: '#ef2b2d',
  },
  {
    id: 'espalda',
    nombre: 'Espalda fuerte',
    ejercicios: [
      { id: 'e1', nombre: 'Dominadas', series: '4', repeticiones: '8', peso: '0', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/PULL-UP.gif' },
      { id: 'e2', nombre: 'Remo con barra', series: '4', repeticiones: '10', peso: '40', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-BENT-OVER-ROW.gif' },
      { id: 'e3', nombre: 'Peso muerto', series: '3', repeticiones: '8', peso: '80', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-DEADLIFT.gif' },
      { id: 'e4', nombre: 'Jalón al pecho', series: '4', repeticiones: '12', peso: '50', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LAT-PULLDOWN.gif' },
      { id: 'e5', nombre: 'Remo en polea baja', series: '3', repeticiones: '12', peso: '45', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Seated-Cable-Row.gif' },
    ],
    dificultad: 'Avanzado',
    color: '#2a9d8f',
  },
  {
    id: 'pecho',
    nombre: 'Pecho definido',
    ejercicios: [
      { id: 'c1', nombre: 'Press banca', series: '4', repeticiones: '10', peso: '60', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-BENCH-PRESS.gif' },
      { id: 'c2', nombre: 'Flexiones', series: '3', repeticiones: '20', peso: '0', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/PUSH-UP.gif' },
      { id: 'c3', nombre: 'Press inclinado', series: '4', repeticiones: '10', peso: '50', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/INCLINE-BARBELL-BENCH-PRESS.gif' },
      { id: 'c4', nombre: 'Aperturas con mancuernas', series: '3', repeticiones: '12', peso: '15', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/DUMBBELL-FLY.gif' },
      { id: 'c5', nombre: 'Fondos en paralelas', series: '3', repeticiones: '10', peso: '0', image: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Triceps-Dips.gif' },
    ],
    dificultad: 'Principiante',
    color: '#f4a261',
  },
];

export default function Rutinas() {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState({ grupo1: [] });
  const [predefinidas, setPredefinidas] = useState([]); // ← separadas del estado de rutinas de usuario
  const [modalVisible, setModalVisible] = useState(false);
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [nombreRutina, setNombreRutina] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [dificultad, setDificultad] = useState(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null); // ← ID del usuario en Firestore
  const [opcionesVisible, setOpcionesVisible] = useState(false);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia de modo oscuro cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  useEffect(() => {
    // 1a. Cargar rutinas del usuario — primero caché local, luego Firestore
    const cargarRutinas = async () => {
      try {
        // Caché instantánea para que la UI no parpadee
        const cached = await AsyncStorage.getItem('rutinas');
        if (cached) {
          const parsed = JSON.parse(cached);
          setRutinas({ grupo1: parsed.grupo1 || [] });
        }

        // Intentar obtener del backend para tener la versión más reciente
        const uid = await AsyncStorage.getItem('userId');
        if (uid) {
          setUserId(uid);
          try {
            const resp = await axios.get(`${BACKEND_URL}/api/routines/${uid}`, { timeout: 8000 });
            const fromServer = resp.data || [];
            // El backend devuelve { id, name, exercises, ... } — adaptamos al formato frontend
            const grupo1 = fromServer.map(r => ({
              id: r.id,
              nombre: r.name || r.nombre || 'Sin nombre',
              ejercicios: r.exercises || r.ejercicios || [],
              dificultad: r.dificultad || 'Sin definir',
              color: r.color || '#264653',
            }));
            const nuevas = { grupo1 };
            setRutinas(nuevas);
            await AsyncStorage.setItem('rutinas', JSON.stringify(nuevas));
          } catch (netErr) {
            console.warn('[Rutinas] Error cargando rutinas del backend (usando caché):', netErr.message);
          }
        }
      } catch (e) {
        console.error('Error cargando rutinas:', e);
      }
    };
    cargarRutinas();

    // 1b. Cargar rutinas predefinidas — caché AsyncStorage primero, luego backend
    const cargarPredefinidas = async () => {
      try {
        const cached = await AsyncStorage.getItem('predefinedRoutines');
        if (cached) {
          // Usar caché: mezclar animaciones/imágenes locales sobre datos de Firestore
          const fromCache = JSON.parse(cached);
          setPredefinidas(mergeWithLocalAssets(fromCache));
          return; // no hacemos petición de red
        }
        // Sin caché → pedir al backend
        const resp = await axios.get(`${BACKEND_URL}/api/routines/predefined`, { timeout: 8000 });
        const fromServer = resp.data || [];
        await AsyncStorage.setItem('predefinedRoutines', JSON.stringify(fromServer));
        setPredefinidas(mergeWithLocalAssets(fromServer));
      } catch (e) {
        console.warn('[Rutinas] No se pudieron cargar las predefinidas del backend, usando locales:', e.message);
        // Fallback a las constantes locales si el backend no responde
        setPredefinidas(rutinasPredefinidas);
      }
    };
    cargarPredefinidas();

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

    const nuevaRutina = {
      id: Date.now().toString(), // ID temporal local
      nombre: nombreRutina.trim(),
      ejercicios: sugerencias,
      dificultad: dificultad || 'Sin definir',
      color: '#264653',
    };

    // Guardar en el estado y en el caché local inmediatamente
    const nuevasRutinas = {
      ...rutinas,
      [grupoActivo]: [...(rutinas[grupoActivo] || []), nuevaRutina],
    };
    setRutinas(nuevasRutinas);
    await guardarEnStorage(nuevasRutinas);

    // Persistir en Firestore en background
    if (userId) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/routines/${userId}`,
          {
            name: nuevaRutina.nombre,
            exercises: nuevaRutina.ejercicios,
            dificultad: nuevaRutina.dificultad,
            color: nuevaRutina.color,
          },
          { timeout: 8000 }
        );
        console.log('[Rutinas] Rutina guardada en Firestore ✅');
      } catch (e) {
        console.warn('[Rutinas] Error guardando rutina en Firestore (guardada solo local):', e.message);
      }
    } else {
      console.warn('[Rutinas] Sin userId — rutina guardada solo en local');
    }

    setNombreRutina('');
    setSugerencias([]);
    setDificultad(null);
    setModalVisible(false);
  };

  const handleEntrarRutina = (rutina, grupoKey) => {
    // ── Registrar rutina reciente en AsyncStorage ──────────────────────────
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('recentRoutines');
        const prev = raw ? JSON.parse(raw) : [];
        const entry = {
          id: rutina.id,
          nombre: rutina.nombre,
          dificultad: rutina.dificultad || 'Sin definir',
          color: rutina.color || '#264653',
          openedAt: Date.now(),
        };
        // Eliminar si ya estaba y poner al principio (más reciente primero)
        const updated = [entry, ...prev.filter(r => r.id !== rutina.id)].slice(0, 5);
        await AsyncStorage.setItem('recentRoutines', JSON.stringify(updated));
      } catch (e) {
        console.warn('[Rutinas] No se pudo guardar rutina reciente:', e.message);
      }
    })();

    navigation.navigate('PantallaRutina', {
      rutina,
      grupoKey,
      actualizarRutina: async (rutinaActualizada) => {
        setRutinas(prev => {
          const nuevasRutinas = {
            ...prev,
            [grupoKey]: (prev[grupoKey] || []).map((r) =>
              r.id === rutinaActualizada.id ? rutinaActualizada : r
            ),
          };
          guardarEnStorage(nuevasRutinas);
          return nuevasRutinas;
        });
      },
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

    // Eliminar del backend
    if (userId && rutinaSeleccionada.id) {
      try {
        await axios.delete(
          `${BACKEND_URL}/api/routines/${userId}/${rutinaSeleccionada.id}`,
          { timeout: 8000 }
        );
        console.log('[Rutinas] Rutina eliminada de Firestore ✅');
      } catch (e) {
        console.warn('[Rutinas] Error eliminando rutina del backend:', e.message);
      }
    }

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

    // Guardar copia en el backend
    if (userId) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/routines/${userId}`,
          {
            name: copia.nombre,
            exercises: copia.ejercicios,
            dificultad: copia.dificultad,
            color: copia.color,
          },
          { timeout: 8000 }
        );
        console.log('[Rutinas] Rutina duplicada en Firestore ✅');
      } catch (e) {
        console.warn('[Rutinas] Error duplicando rutina en Firestore:', e.message);
      }
    }

    setOpcionesVisible(false);
  };

  // Mezcla datos de Firestore con animaciones/imágenes definidas localmente
  const mergeWithLocalAssets = (serverRoutines) => {
    return serverRoutines.map(sr => {
      const local = rutinasPredefinidas.find(r => r.id === sr.id);
      if (!local) return sr;
      const mergedEjercicios = (sr.ejercicios || []).map(se => {
        const le = local.ejercicios.find(e => e.id === se.id || e.nombre === se.nombre);
        if (!le) return se;
        return { ...se, image: le.image, animacion: le.animacion };
      });
      return { ...local, ...sr, ejercicios: mergedEjercicios };
    });
  };

  const renderGrupo = (titulo, rutinasGrupo, grupoKey) => {
    return (
      <View style={styles.grupoContainer}>
        <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>{titulo}</Text>
        <View style={styles.rutinasRow}>
          {(rutinasGrupo || []).map((rutina) => (
            <TouchableOpacity
              key={rutina.id}
              style={[styles.rutinaCard, { backgroundColor: rutina.color || '#ccc' }]}
              onPress={() => handleEntrarRutina(rutina, grupoKey)}
              onLongPress={() => handleLongPress(rutina)}
            >
              <Ionicons name="barbell" size={24} color="#fff" />
              <Text style={styles.rutinaTexto}>{rutina.nombre}</Text>
              <Text style={styles.rutinaSubTexto}>
                {rutina.ejercicios.length} ejercicios
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addCard, darkMode && styles.darkAddCard]}
            onPress={() => handleAddRutina(grupoKey)}
          >
            <Ionicons name="add" size={32} color="#ef2b2d" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPredefinidas = () => (
    <View style={styles.grupoContainer}>
      <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>Rutinas recomendadas</Text>
      <View style={styles.rutinasRow}>
        {(predefinidas.length > 0 ? predefinidas : rutinasPredefinidas).map((rutina) => (
          <TouchableOpacity
            key={rutina.id}
            style={[styles.rutinaCard, { backgroundColor: rutina.color }]}
            onPress={() => handleEntrarRutina(rutina, 'predefinidas')}
          // onLongPress desactivado en rutinas predefinidas
          >
            <Ionicons name="barbell" size={24} color="#fff" />
            <Text style={styles.rutinaTexto}>{rutina.nombre}</Text>
            <Text style={styles.rutinaSubTexto}>
              {rutina.ejercicios.length} ejercicios
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "auto"} />
      <Header title="Rutinas" showBackButton={false} />

      <View style={[styles.greetingContainer, darkMode && { backgroundColor: '#121212' }]}>
        <Text style={[styles.greetingText, darkMode && styles.darkText]}>Hola {userName || 'usuario'},</Text>
        <Text style={[styles.subGreetingText, darkMode && styles.darkTextSecondary]}>¿listo para entrenar?</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: '#121212' }]} showsVerticalScrollIndicator={false}>
        {renderPredefinidas()}
        {renderGrupo('Mis rutinas personalizadas', rutinas.grupo1, 'grupo1')}
      </ScrollView>

      {/* Modal para crear rutina */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModal]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Crear rutina</Text>
            <TextInput
              style={[styles.input, darkMode && { borderColor: '#444', backgroundColor: '#1e1e1e', color: '#fff' }]}
              placeholder="Ej. Piernas explosivas"
              placeholderTextColor={darkMode ? '#888' : '#aaa'}
              value={nombreRutina}
              onChangeText={setNombreRutina}
            />
            {sugerencias.length > 0 && (
              <View style={styles.sugerenciasContainer}>
                <Text style={[styles.sugerenciasTitulo, darkMode && styles.darkText]}>Ejercicios sugeridos:</Text>
                <View style={styles.chipsContainer}>
                  {sugerencias.map((ejercicio, index) => (
                    <View key={index} style={[styles.chip, darkMode && { borderColor: '#555' }]}>
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
                    darkMode && { borderColor: '#555' },
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
          </View>
        </View>
      </Modal>

      {/* Modal de opciones (long press) */}
      <Modal visible={opcionesVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.darkModal]}>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Opciones</Text>
            <TouchableOpacity onPress={() => {
              if (rutinaSeleccionada) handleEntrarRutina(rutinaSeleccionada, 'grupo1');
            }}>
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333', marginBottom: 12 }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDuplicarRutina}>
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333', marginBottom: 12 }]}>Duplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEliminarRutina}>
              <Text style={[styles.modalButtonText, { color: '#ef2b2d', marginBottom: 12 }]}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpcionesVisible(false)}>
              <Text style={[styles.modalButtonText, { color: darkMode ? '#888' : '#666' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  greetingContainer: {
    paddingVertical: 15,
    marginBottom: 10,

  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  subGreetingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 2,
    position: 'center',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grupoContainer: {
    marginBottom: 30,
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  rutinasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  rutinaCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  rutinaTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  rutinaSubTexto: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  addCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef2b2d',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkAddCard: {
    backgroundColor: '#1e1e1e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
  },
  darkModal: {
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});