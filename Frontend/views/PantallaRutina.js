import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../src/config';

export default function PantallaRutina({ route, navigation }) {
  const { rutina, grupoKey, actualizarRutina } = route.params;
  const [ejercicios, setEjercicios] = useState(rutina.ejercicios || []);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [filtro, setFiltro] = useState('');

  // Estado del menú bonito
  const [opcionesVisible, setOpcionesVisible] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);

  // Estado para los ejercicios obtenidos del backend
  const [backendExercises, setBackendExercises] = useState({}); // { [grupo]: [ejercicios] }
  const [userId, setUserId] = useState(null);

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
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

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
        const id = await AsyncStorage.getItem('userId');
        if (id) setUserId(id);
      } catch (e) {
        console.error('Error getting userId:', e);
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

  // Autosave function
  const saveRoutineChanges = async (newExercises) => {
    if (!userId || !rutina.id) return;

    try {
      const url = getBackendUrl(`/routines/${userId}/${rutina.id}`);
      const payload = {
        exercises: newExercises
      };
      await axios.put(url, payload);
    } catch (error) {
      console.error('Error autosaving routine:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios en la nube');
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
    actualizarRutina({ ...rutina, ejercicios: nuevaLista });

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
    actualizarRutina({ ...rutina, ejercicios: nuevaLista });

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
    actualizarRutina({ ...rutina, ejercicios: nuevaLista });

    setOpcionesVisible(false);
  };

  return (
    <View style={[styles.rutinaContainer, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "auto"} backgroundColor={darkMode ? "#121212" : "transparent"} translucent={true} />
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={styles.title}>{rutina.nombre}</Text>
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
            onLongPress={grupoKey !== 'predefinidas' ? () => {
              setEjercicioSeleccionado(item);
              setOpcionesVisible(true);
            } : undefined}
          >
            <View style={[styles.ejercicioItem, darkMode && styles.darkItemBorder]}>
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
                  <Ionicons name="barbell-outline" size={40} color={darkMode ? "#aaa" : "#555"} />
                )}

              <View style={styles.rowBetween}>
                <Text style={[styles.ejercicioTexto, darkMode && styles.darkText]}>{item.nombre}</Text>

                {item.series && item.repeticiones && item.peso && (
                  <Text style={[styles.datosEjercicio, darkMode && styles.darkTextSecondary]}>
                    {item.series}x{item.repeticiones}x{item.peso}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, darkMode && styles.darkTextSecondary]}>No hay ejercicios añadidos aún.</Text>
        }
      />

      {/* MODAL BUSCADOR */}
      <Modal visible={buscadorVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.buscadorContainer, darkMode && styles.darkModalContent]}>
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
                    <Text style={[styles.grupoTitulo, darkMode && { color: '#ef5656' }]}>{grupo.toUpperCase()}</Text>
                    {filteredList.map((ejercicio) => (
                      <TouchableOpacity
                        key={ejercicio.id || ejercicio.name}
                        style={[styles.ejercicioItemModal, darkMode && { borderBottomColor: '#333' }]}
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
                          <Text style={[{ flex: 1, flexWrap: 'wrap' }, darkMode && styles.darkText]}>{ejercicio.name || ejercicio.nombre}</Text>
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
              style={styles.cerrar}
            >
              <Text style={styles.cerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL OPCIONES */}
      <Modal visible={opcionesVisible} transparent animationType="fade">
        <View style={styles.optionsOverlay}>
          <View style={[styles.optionsCard, darkMode && styles.darkModalContent]}>
            <Text style={[styles.optionsTitle, darkMode && styles.darkText]}>Opciones del ejercicio</Text>

            {/* BOTÓN EDITAR */}
            <TouchableOpacity
              style={[styles.optionButton2, darkMode && styles.darkOptionButton]}
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

            {/* DUPLICAR */}
            <TouchableOpacity
              style={[styles.optionButton2, darkMode && styles.darkOptionButton]}
              onPress={() => {
                handleDuplicateEjercicio();
              }}
            >
              <Ionicons name="copy-outline" size={22} color="#ef2b2d" />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Duplicar ejercicio</Text>
            </TouchableOpacity>

            {/* ELIMINAR */}
            <TouchableOpacity
              style={[styles.optionButton2, styles.deleteButton]}
              onPress={() => {
                handleDeleteEjercicio();
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#fff" />
              <Text style={[styles.optionText, { color: '#fff' }]}>
                Eliminar ejercicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, darkMode && { backgroundColor: '#2a2a2a' }]}
              onPress={() => setOpcionesVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DETALLES */}
      <Modal visible={detallesVisible} transparent animationType="slide">
        <View style={styles.optionsOverlay}>
          <View style={[styles.optionsCard, darkMode && styles.darkModalContent]}>
            <Text style={[styles.optionsTitle, darkMode && styles.darkText]}>{ejercicioEnEdicion?.nombre || ejercicioEnEdicion?.name}</Text>

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

            <TextInput
              style={[styles.inputDescripcion, darkMode && { backgroundColor: '#2a2a2a', color: '#aaa' }]}
              value={descripcionEjercicio}
              editable={false}
              multiline
            />

            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              placeholder="Repeticiones"
              placeholderTextColor={darkMode ? "#888" : "#999"}
              keyboardType="numeric"
              value={repeticionesEjercicio}
              onChangeText={setRepeticionesEjercicio}
            />

            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              placeholder="Peso (kg)"
              placeholderTextColor={darkMode ? "#888" : "#999"}
              keyboardType="numeric"
              value={pesoEjercicio}
              onChangeText={setPesoEjercicio}
            />

            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              placeholder="Series"
              placeholderTextColor={darkMode ? "#888" : "#999"}
              keyboardType="numeric"
              value={series}
              onChangeText={setSeries}
            />

            {/* GUARDAR */}
            <TouchableOpacity
              style={[styles.optionButton, darkMode && { backgroundColor: '#27894940' }]}
              onPress={() => {
                if (modoEdicion) {
                  // EDITAR
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
                  actualizarRutina({ ...rutina, ejercicios: nuevaLista });
                  setModoEdicion(false);

                } else {
                  // AÑADIR
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
                  actualizarRutina({ ...rutina, ejercicios: nuevaLista });
                }

                setDetallesVisible(false);
                setBuscadorVisible(false);
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#3a9238ff"
              />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Guardar ejercicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, darkMode && { backgroundColor: '#2a2a2a' }]}
              onPress={() => {
                setModoEdicion(false);
                setDetallesVisible(false);
              }}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===================== ESTILOS ===================== */

const styles = StyleSheet.create({
  rutinaContainer: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef2b2d',
  },
  ejercicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
  },
  darkItemBorder: {
    borderBottomColor: '#333',
  },
  ejercicioTexto: {
    fontSize: 16,
    color: '#111',
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  datosEjercicio: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
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
  darkInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderColor: '#444',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
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
  darkOptionButton: {
    backgroundColor: '#44444440',
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
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#bbbbbbff',
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#ef2b2d',
  },
});
