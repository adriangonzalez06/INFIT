import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  Image,
  useColorScheme,
  StatusBar
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LottieView from 'lottie-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../src/config';
import colors from './colors';

export default function PantallaRutina({ route, navigation }) {
  const { rutina, grupoKey } = route.params;
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

    const unsubscribe = navigation.addListener('focus', () => {
      loadTheme();
    });

    return unsubscribe;
  }, [navigation]);

  const [ejercicios, setEjercicios] = useState(rutina.ejercicios || []);

  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [filtro, setFiltro] = useState('');

  // Estado del menú bonito
  const [opcionesVisible, setOpcionesVisible] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);

  // Estado para los ejercicios obtenidos del backend
  const [backendExercises, setBackendExercises] = useState({}); // { [grupo]: [ejercicios] }
  const [userId, setUserId] = useState(null);

  // Helper para URL — usa BACKEND_URL del config.js
  const getBackendUrl = (path) => `${BACKEND_URL}/api${path}`;
  // Modal de detalles
  const [detallesVisible, setDetallesVisible] = useState(false);
  const [ejercicioEnEdicion, setEjercicioEnEdicion] = useState(null);
  const [descripcionEjercicio, setDescripcionEjercicio] = useState('');
  const [pesoEjercicio, setPesoEjercicio] = useState('');
  const [repeticionesEjercicio, setRepeticionesEjercicio] = useState('');
  const [series, setSeries] = useState('');

  // NUEVO: modo edición
  const [modoEdicion, setModoEdicion] = useState(false);

  // Ejercicios predefinidos
  const ejerciciosPredefinidos = {
    piernas: [
      {
        nombre: 'Sentadilla',
        animacion: require('../assets/ejercicios/sentadilla.json'),
        descripcion: 'Ejercicio básico de piernas que trabaja cuádriceps, glúteos y core.',
      },
    ],
  };

  useEffect(() => {
    const init = async () => {
      try {
        const id = await AsyncStorage.getItem('userDocId');
        if (id) setUserId(id);
      } catch (e) {
        console.error('Error getting userDocId:', e);
      }
    };
    init();
  }, []);

  // Cargar ejercicios desde el backend
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const url = getBackendUrl('/exercises');
        const response = await axios.get(url);

        if (response.data) {
          // Agrupar por muscular_group
          const grouped = {};
          response.data.forEach((ex) => {
            const group = ex.muscular_group || 'General';
            if (!grouped[group]) {
              grouped[group] = [];
            }
            grouped[group].push(ex);
          });
          setBackendExercises(grouped);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  // Guarda la rutina actualizada en AsyncStorage
  const saveToStorage = async (newExercises) => {
    try {
      const data = await AsyncStorage.getItem('rutinas');
      if (data) {
        const parsed = JSON.parse(data);
        const key = grupoKey || 'grupo1';
        if (parsed[key]) {
          parsed[key] = parsed[key].map((r) =>
            r.id === rutina.id ? { ...r, ejercicios: newExercises } : r
          );
          await AsyncStorage.setItem('rutinas', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('Error saving to AsyncStorage:', e.message);
    }
  };

  // Autosave a Firestore
  const saveRoutineChanges = async (newExercises) => {
    // Guardar localmente siempre
    await saveToStorage(newExercises);

    if (!userId || !rutina.id) return;
    try {
      const url = getBackendUrl(`/routines/${userId}/${rutina.id}`);
      await axios.put(url, { exercises: newExercises });
    } catch (error) {
      console.warn('Error autosaving to Firestore:', error.message);
    }
  };

  // Añadir ejercicio
  const handleAddEjercicio = async (ejercicioObj) => {
    const nuevoEjercicio = {
      id: Date.now().toString(),
      nombre: ejercicioObj.name || ejercicioObj.nombre,
      animacion: ejercicioObj.animacion,
      image: ejercicioObj.image,
      gif: ejercicioObj.gif,
      isBackend: true,
      originalData: ejercicioObj,
    };

    const nuevaLista = [...ejercicios, nuevoEjercicio];
    setEjercicios(nuevaLista);
    await saveRoutineChanges(nuevaLista);

    setBuscadorVisible(false);
    setFiltro('');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleDeleteEjercicio = async () => {
    if (!ejercicioSeleccionado) return;

    const nuevaLista = ejercicios.filter((e) => e.id !== ejercicioSeleccionado.id);
    setEjercicios(nuevaLista);
    await saveRoutineChanges(nuevaLista);

    setOpcionesVisible(false);
  };

  const handleDuplicateEjercicio = async () => {
    if (!ejercicioSeleccionado) return;

    const copia = {
      ...ejercicioSeleccionado,
      id: Date.now().toString(),
    };

    const nuevaLista = [...ejercicios, copia];
    setEjercicios(nuevaLista);
    await saveRoutineChanges(nuevaLista);

    setOpcionesVisible(false);
  };

  return (
    <SafeAreaView style={[styles.rutinaContainer, darkMode && styles.darkContainer]}>
      <ExpoStatusBar style={darkMode ? "light" : "auto"} />

      {/* HEADER */}
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{rutina.nombre}</Text>

        <TouchableOpacity onPress={() => setBuscadorVisible(true)}>
          <Ionicons name="search" size={24} color="#ef2b2d" />
        </TouchableOpacity>
      </View>

      {/* LISTA DE EJERCICIOS */}
      <FlatList
        contentContainerStyle={{ paddingTop: 0 }}
        data={ejercicios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => {
              setEjercicioSeleccionado(item);
              setOpcionesVisible(true);
            }}
          >
            <View style={styles.ejercicioItem}>
              {item.animacion ? (
                <LottieView
                  source={item.animacion}
                  autoPlay
                  loop
                  style={styles.iconoGif}
                />
              )
                : item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.iconoGif}
                    resizeMode="cover"
                    resizeMethod="resize"
                    onError={(e) => console.log(`Error loading image for ${item.nombre}:`, e.nativeEvent.error)}
                  />
                ) : (
                  <Ionicons name="barbell-outline" size={40} color={darkMode ? "#ccc" : "#555"} />
                )}

              <View style={styles.ejercicioInfo}>
                <Text style={[styles.ejercicioTexto, darkMode && styles.darkText]} numberOfLines={1}>{item.nombre}</Text>

                <View style={styles.datosBadgeStack}>
                  {item.series ? (
                    <View style={[styles.datoBadge, darkMode && styles.darkDatoBadge]}>
                      <Text style={[styles.datoBadgeText, darkMode && styles.darkDatoBadgeText]}>{item.series} series</Text>
                    </View>
                  ) : null}
                  {item.repeticiones ? (
                    <View style={[styles.datoBadge, darkMode && styles.darkDatoBadge]}>
                      <Text style={[styles.datoBadgeText, darkMode && styles.darkDatoBadgeText]}>{item.repeticiones} reps</Text>
                    </View>
                  ) : null}
                  {item.peso ? (
                    <View style={[styles.datoBadge, darkMode && styles.darkDatoBadge]}>
                      <Text style={[styles.datoBadgeText, darkMode && styles.darkDatoBadgeText]}>{item.peso} kg</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, darkMode && styles.darkTextSecondary]}>No hay ejercicios añadidos aún.</Text>
        }

      />

      {/* MODAL BUSCADOR */}
      <Modal visible={buscadorVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.optionsOverlay}
          activeOpacity={1}
          onPress={() => setBuscadorVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.optionsCard, darkMode && styles.darkModalContent, { height: '80%' }]}
          >
            <View style={styles.bottomSheetIndicator} />
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Añadir ejercicio</Text>
            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              placeholder="Buscar ejercicio..."
              placeholderTextColor={darkMode ? "#888" : "#999"}
              value={filtro}
              onChangeText={setFiltro}
            />


            <FlatList
              data={Object.entries(backendExercises)}
              keyExtractor={([grupo]) => grupo}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              renderItem={({ item: [grupo, lista] }) => {
                const filteredList = lista.filter((ej) =>
                  (ej.name || '').toLowerCase().includes(filtro.toLowerCase())
                );

                if (filteredList.length === 0) return null;

                return (
                  <View>
                    <Text style={[styles.grupoTitulo, darkMode && { color: colors.primary }]}>{grupo.toUpperCase()}</Text>
                    {filteredList.map((ejercicio, idx) => (
                      <TouchableOpacity
                        key={ejercicio.id || ejercicio.name || `ej-${idx}`}
                        style={styles.ejercicioItemModal}
                        onPress={() => {
                          setModoEdicion(false);
                          setEjercicioEnEdicion(ejercicio);
                          setDescripcionEjercicio(ejercicio.descripcion);
                          setPesoEjercicio('');
                          setRepeticionesEjercicio('');
                          setSeries('');
                          setDetallesVisible(true);
                        }}
                      >
                        <View style={styles.row}>
                          {ejercicio.animacion ? (
                            <LottieView
                              source={ejercicio.animacion}
                              autoPlay
                              loop
                              style={styles.iconoGif}
                            />
                          ) : ejercicio.image ? (
                            <Image
                              source={{ uri: ejercicio.image }}
                              style={styles.iconoGif}
                              resizeMode="cover"
                              resizeMethod="resize" // Optimizes memory on Android
                              onError={(e) => console.log(`Error loading modal image for ${ejercicio.name}:`, e.nativeEvent.error)}
                            />
                          ) : (
                            <Ionicons name="fitness" size={40} color="#ef2b2d" />
                          )}
                          <Text style={[styles.ejercicioItemModalText, darkMode && styles.darkText]}>{ejercicio.name || ejercicio.nombre}</Text>
                        </View>

                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={[{ textAlign: 'center', padding: 20 }, darkMode && styles.darkTextSecondary]}>
                  {Object.keys(backendExercises).length === 0 ? 'Cargando ejercicios...' : 'No se encontraron ejercicios.'}
                </Text>
              }

            />

            <TouchableOpacity
              onPress={() => setBuscadorVisible(false)}
              style={[styles.cancelButton, darkMode && styles.darkCancelButton]}
            >
              <Text style={[styles.cancelText, darkMode && styles.darkCancelText]}>Cerrar</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL OPCIONES */}
      <Modal visible={opcionesVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.optionsOverlay}
          activeOpacity={1}
          onPress={() => setOpcionesVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.optionsCard, darkMode && styles.darkModalContent]}
          >
            <View style={styles.bottomSheetIndicator} />
            <Text style={[styles.optionsTitle, darkMode && styles.darkText]}>Opciones del ejercicio</Text>


            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setOpcionesVisible(false);
                setModoEdicion(true);
                setEjercicioEnEdicion(ejercicioSeleccionado);
                setDescripcionEjercicio(ejercicioSeleccionado.descripcion || '');
                setPesoEjercicio(ejercicioSeleccionado.peso || '');
                setRepeticionesEjercicio(ejercicioSeleccionado.repeticiones || '');
                setSeries(ejercicioSeleccionado.series || '');
                setDetallesVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={22} color="#ef2b2d" />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Editar ejercicio</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.optionItem} onPress={handleDuplicateEjercicio}>
              <Ionicons name="copy-outline" size={22} color="#ef2b2d" />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Duplicar ejercicio</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.optionItem} onPress={handleDeleteEjercicio}>
              <Ionicons name="trash-outline" size={22} color="#ef2b2d" />
              <Text style={[styles.optionText, { color: '#ef2b2d' }]}>Eliminar ejercicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, darkMode && styles.darkCancelButton, { marginTop: 20 }]}
              onPress={() => setOpcionesVisible(false)}
            >
              <Text style={[styles.cancelText, darkMode && styles.darkCancelText]}>Cerrar</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DETALLES */}
      <Modal visible={detallesVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.optionsOverlay}
          activeOpacity={1}
          onPress={() => setDetallesVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.optionsCard, darkMode && styles.darkModalContent]}
          >
            <View style={styles.bottomSheetIndicator} />
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>{ejercicioEnEdicion?.nombre || ejercicioEnEdicion?.name}</Text>


            {ejercicioEnEdicion?.animacion ? (
              <LottieView
                source={ejercicioEnEdicion.animacion}
                autoPlay
                loop
                style={{ width: 150, height: 150, alignSelf: 'center' }}
              />
            ) : ejercicioEnEdicion?.image ? (
              <Image
                source={{ uri: ejercicioEnEdicion.image }}
                style={{ width: 150, height: 150, alignSelf: 'center', borderRadius: 10 }}
                resizeMode="cover"
              />
            ) : null}

            {descripcionEjercicio ? (
              <Text style={[styles.descripcionEjercicioText, darkMode && styles.darkTextSecondary]}>
                {descripcionEjercicio}
              </Text>
            ) : null}

            <View style={styles.inputsRow}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, darkMode && styles.darkTextSecondary]}>Reps</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.darkInput]}
                  placeholder="0"
                  placeholderTextColor={darkMode ? "#888" : "#999"}
                  keyboardType="numeric"
                  value={repeticionesEjercicio}
                  onChangeText={setRepeticionesEjercicio}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, darkMode && styles.darkTextSecondary]}>Peso (kg)</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.darkInput]}
                  placeholder="0"
                  placeholderTextColor={darkMode ? "#888" : "#999"}
                  keyboardType="numeric"
                  value={pesoEjercicio}
                  onChangeText={setPesoEjercicio}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, darkMode && styles.darkTextSecondary]}>Series</Text>
                <TextInput
                  style={[styles.input, darkMode && styles.darkInput]}
                  placeholder="0"
                  placeholderTextColor={darkMode ? "#888" : "#999"}
                  keyboardType="numeric"
                  value={series}
                  onChangeText={setSeries}
                />
              </View>
            </View>


            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: '#ef2b2d', flex: 2 }]}
                onPress={async () => {
                  if (modoEdicion) {
                    const actualizado = {
                      ...ejercicioEnEdicion,
                      descripcion: descripcionEjercicio,
                      series,
                      repeticiones: repeticionesEjercicio,
                      peso: pesoEjercicio,
                    };
                    const nuevaLista = ejercicios.map((e) =>
                      e.id === ejercicioEnEdicion.id ? actualizado : e
                    );
                    setEjercicios(nuevaLista);
                    await saveRoutineChanges(nuevaLista);
                    actualizarRutina({ ...rutina, ejercicios: nuevaLista });
                    setModoEdicion(false);
                  } else {
                    const nuevo = {
                      id: Date.now().toString(),
                      nombre: ejercicioEnEdicion.nombre || ejercicioEnEdicion.name,
                      animacion: ejercicioEnEdicion.animacion,
                      image: ejercicioEnEdicion.image,
                      gif: ejercicioEnEdicion.gif,
                      descripcion: descripcionEjercicio,
                      series,
                      repeticiones: repeticionesEjercicio,
                      peso: pesoEjercicio,
                    };
                    const nuevaLista = [...ejercicios, nuevo];
                    setEjercicios(nuevaLista);
                    await saveRoutineChanges(nuevaLista);
                    actualizarRutina({ ...rutina, ejercicios: nuevaLista });
                  }
                  setDetallesVisible(false);
                  setBuscadorVisible(false);
                }}
              >
                <Text style={[styles.optionText, { color: '#fff' }]}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, darkMode && styles.darkCancelButton, { flex: 1, marginTop: 0 }]}
                onPress={() => {
                  setModoEdicion(false);
                  setDetallesVisible(false);
                }}
              >
                <Text style={[styles.cancelText, darkMode && styles.darkCancelText]}>Cerrar</Text>
              </TouchableOpacity>

            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */

const styles = StyleSheet.create({
  rutinaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: colors.bg_dark,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkHeader: {
    backgroundColor: colors.bg_dark,
    borderBottomColor: '#333',
    borderTopColor: '#333',
  },


  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark_gray || '#333',
  },
  ejercicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    paddingHorizontal: 20,
  },
  darkItemBorder: {
    borderBottomColor: '#333',
  },
  ejercicioInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ejercicioTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  datosBadgeStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  datoBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  darkDatoBadge: {
    backgroundColor: '#333',
  },
  datoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  darkDatoBadgeText: {
    color: '#aaa',
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buscadorContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputDescripcion: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    height: 80,
    textAlign: 'center',
    marginTop: 20,
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#ef2b2d',
  },
  ejercicioItemModal: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ejercicioItemModalText: {
    fontSize: 16,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconoGif: {
    width: 40,
    height: 40,
  },
  cerrar: {
    marginTop: 10,
    alignSelf: 'center',
  },
  cerrarTexto: {
    color: '#ef2b2d',
    fontWeight: '600',
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  optionsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#27894920',
    marginBottom: 12,
    gap: 10,
  },
  optionButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#a6a6a620',
    marginBottom: 12,
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ef2b2d',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  bottomSheetIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descripcionEjercicioText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  optionButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#fff',
  },
  darkModalContent: {
    backgroundColor: colors.bg_dark,
  },
  darkCancelButton: {
    backgroundColor: '#333',
  },
  darkCancelText: {
    color: '#aaa',
  },
});

