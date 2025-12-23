import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
      {
        id: 'p1',
        nombre: 'Barbell Squat',
        muscular_group: 'quadriceps',
        difficulty: 'intermediate',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell/Barbell_Squat/0.jpg'
      },
      {
        id: 'p2',
        nombre: 'Barbell Walking Lunge',
        muscular_group: 'quadriceps',
        difficulty: 'intermediate',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell/Barbell_Walking_Lunge/0.jpg'
      },
      {
        id: 'p3',
        nombre: 'Romanian Deadlift',
        muscular_group: 'hamstrings',
        difficulty: 'intermediate',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell/Romanian_Deadlift/0.jpg'
      }
    ],
    dificultad: 'Intermedio',
    color: '#ef2b2d',
  },
  {
    id: 'espalda',
    nombre: 'Espalda fuerte',
    ejercicios: [
      {
        id: 'e1',
        nombre: 'Pull-up',
        muscular_group: 'lats',
        difficulty: 'intermediate',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/body_weight/Pull-up/0.jpg'
      },
      {
        id: 'e2',
        nombre: 'Bent Over Barbell Row',
        muscular_group: 'middle back',
        difficulty: 'beginner',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell/Bent_Over_Barbell_Row/0.jpg'
      },
      {
        id: 'e3',
        nombre: 'Deadlift',
        muscular_group: 'lower back',
        difficulty: 'intermediate',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell/Deadlift/0.jpg'
      }
    ],
    dificultad: 'Avanzado',
    color: '#2a9d8f',
  },
  {
    id: 'pecho',
    nombre: 'Pecho definido',
    ejercicios: [
      {
        id: 'c1',
        nombre: 'Barbell Bench Press',
        muscular_group: 'chest',
        difficulty: 'intermediate',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell/Barbell_Bench_Press_-_Medium_Grip/0.jpg'
      },
      {
        id: 'c2',
        nombre: 'Pushups',
        muscular_group: 'chest',
        difficulty: 'beginner',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/body_weight/Pushups/0.jpg'
      },
      {
        id: 'c3',
        nombre: 'Incline Dumbbell Flyes',
        muscular_group: 'chest',
        difficulty: 'beginner',
        image: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell/Incline_Dumbbell_Flyes/0.jpg'
      }
    ],
    dificultad: 'Principiante',
    color: '#f4a261',
  },
];

export default function Rutinas({ route }) {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState({ grupo1: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [nombreRutina, setNombreRutina] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [dificultad, setDificultad] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [opcionesVisible, setOpcionesVisible] = useState(false);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleVolverInicio = () => {
    navigation.navigate('MainTabs');
  };

  // Helper para URL
  const getBackendUrl = (path) => {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:8082/api${path}`;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
          fetchRutinas(id);
        }
      } catch (e) {
        console.error('Error obteniendo userId:', e);
      }
    };
    init();
  }, []);

  const fetchRutinas = async (id) => {
    try {
      const url = getBackendUrl(`/routines/${id}`);
      const response = await axios.get(url);
      if (response.data) {
        // Map backend 'exercises' to frontend 'ejercicios'
        const mappedRoutines = response.data.map(r => ({
          ...r,
          ejercicios: r.exercises || [],
          nombre: r.name // Ensure name is also available as nombre
        }));
        setRutinas({ grupo1: mappedRoutines });
      }
    } catch (error) {
      console.log('Error cargando rutinas:', error.message);
    }
  };


  useEffect(() => {
    const palabraClave = Object.keys(SUGERENCIAS).find((clave) =>
      nombreRutina.toLowerCase().includes(clave)
    );
    setSugerencias(palabraClave ? SUGERENCIAS[palabraClave] : []);
  }, [nombreRutina]);

  /* Removed guardarEnStorage as we use Backend API now */

  const handleAddRutina = (grupo) => {
    setGrupoActivo(grupo);
    setModalVisible(true);
  };

  const handleGuardarRutina = async () => {
    if (!nombreRutina.trim() || !userId) return;

    const nuevaRutina = {
      name: nombreRutina.trim(),
      exercises: sugerencias,
      day: dificultad || 'Sin definir',
      color: '#264653',
    };

    try {
      const url = getBackendUrl(`/routines/${userId}`);
      const response = await axios.post(url, nuevaRutina);

      if (response.status === 201) {
        // Mapping back for frontend compat
        const rutinaCreada = {
          ...nuevaRutina,
          id: response.data.id,
          nombre: nuevaRutina.name,
          dificultad: nuevaRutina.day
        };

        const nuevasRutinas = {
          ...rutinas,
          [grupoActivo]: [...rutinas[grupoActivo], rutinaCreada],
        };

        setRutinas(nuevasRutinas);
      }
    } catch (error) {
      console.error('Error creando rutina:', error);
      Alert.alert('Error', 'No se pudo crear la rutina');
    }

    setNombreRutina('');
    setSugerencias([]);
    setDificultad(null);
    setModalVisible(false);
  };

  const handleEntrarRutina = (rutina, grupoKey) => {
    navigation.navigate('PantallaRutina', {
      rutina,
      grupoKey,
    });
  };

  useEffect(() => {
    if (route.params?.updatedRutina && route.params?.grupoKey) {
      // Refresh from backend to ensure consistency
      if (userId) fetchRutinas(userId);
      navigation.setParams({ updatedRutina: null, grupoKey: null });
    }
  }, [route.params?.updatedRutina]);

  const handleLongPress = (rutina) => {
    setRutinaSeleccionada(rutina);
    setOpcionesVisible(true);
  };

  const handleEliminarRutina = async () => {
    if (!rutinaSeleccionada || !userId) return;

    try {
      const url = getBackendUrl(`/routines/${userId}/${rutinaSeleccionada.id}`);
      await axios.delete(url);

      const nuevasRutinas = {
        ...rutinas,
        grupo1: rutinas.grupo1.filter((r) => r.id !== rutinaSeleccionada.id),
      };
      setRutinas(nuevasRutinas);
    } catch (error) {
      console.error('Error eliminando rutina:', error);
      Alert.alert('Error', 'No se pudo eliminar la rutina');
    }
    setOpcionesVisible(false);
  };

  const handleDuplicarRutina = async () => {
    if (!rutinaSeleccionada || !userId) return;

    try {
      const nuevaRutina = {
        name: `${rutinaSeleccionada.nombre || rutinaSeleccionada.name} (Copia)`,
        day: rutinaSeleccionada.dificultad || 'Sin definir',
        exercises: rutinaSeleccionada.ejercicios || []
      };

      const url = getBackendUrl(`/routines/${userId}`);
      const response = await axios.post(url, nuevaRutina);

      if (response.status === 201) {
        fetchRutinas(userId);
      }
    } catch (error) {
      console.error('Error duplicando rutina:', error);
    }
    setOpcionesVisible(false);
  };

  const renderGrupo = (titulo, rutinasGrupo, grupoKey) => {
    // Safety check for search filter
    const term = (busqueda || '').toLowerCase();

    const filtradas = rutinasGrupo.filter((r) => {
      const nombre = r.nombre || r.name || '';
      return nombre.toLowerCase().includes(term);
    });

    return (
      <View style={styles.grupoContainer}>
        <Text style={styles.grupoTitulo}>{titulo}</Text>
        <View style={styles.rutinasRow}>
          {filtradas.map((rutina) => (
            <TouchableOpacity
              key={rutina.id}
              style={[styles.rutinaCard, { backgroundColor: rutina.color || '#ccc' }]}
              onPress={() => handleEntrarRutina(rutina, grupoKey)}
              onLongPress={() => handleLongPress(rutina)}
            >
              <Ionicons name="barbell" size={24} color="#fff" />
              <Text style={styles.rutinaTexto}>{rutina.nombre || rutina.name || 'Sin nombre'}</Text>
              <Text style={styles.rutinaSubTexto}>
                {rutina.ejercicios ? rutina.ejercicios.length : 0} ejercicios
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addCard}
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
      <Text style={styles.grupoTitulo}>Rutinas recomendadas</Text>
      <View style={styles.rutinasRow}>
        {rutinasPredefinidas.map((rutina) => (
          <TouchableOpacity
            key={rutina.id}
            style={[styles.rutinaCard, { backgroundColor: rutina.color }]}
            onPress={() => handleEntrarRutina(rutina, 'predefinidas')}
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
    <View style={styles.container}>

      <Text style={styles.title}>Mis rutinas</Text>
      <TouchableOpacity style={styles.backButton} onPress={handleVolverInicio}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar rutinas"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderPredefinidas()}
        {renderGrupo('Mis rutinas personalizadas', rutinas.grupo1, 'grupo1')}
      </ScrollView>

      {/* Modal para crear rutina */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear rutina</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Piernas explosivas"
              value={nombreRutina}
              onChangeText={setNombreRutina}
            />
            {sugerencias.length > 0 && (
              <View style={styles.sugerenciasContainer}>
                <Text style={styles.sugerenciasTitulo}>Ejercicios sugeridos:</Text>
                <View style={styles.chipsContainer}>
                  {sugerencias.map((ejercicio, index) => (
                    <View key={index} style={styles.chip}>
                      <Text style={styles.chipText}>{ejercicio}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <Text style={styles.sugerenciasTitulo}>Dificultad:</Text>
            <View style={styles.chipsContainer}>
              {DIFICULTADES.map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    styles.chip,
                    dificultad === nivel && styles.chipSelected,
                  ]}
                  onPress={() => setDificultad(nivel)}
                >
                  <Text
                    style={[
                      styles.chipText,
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
        <View style={styles.optionsOverlay}>
          <View style={styles.optionsCard}>

            <Text style={styles.optionsTitle}>Opciones de rutina</Text>



            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setOpcionesVisible(false);
                handleDuplicarRutina();
              }}
            >
              <Ionicons name="copy-outline" size={22} color="#ef2b2d" />
              <Text style={styles.optionText}>Duplicar rutina</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.deleteButton]}
              onPress={() => {
                setOpcionesVisible(false);
                handleEliminarRutina();
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#fff" />
              <Text style={[styles.optionText, { color: '#fff' }]}>Eliminar rutina</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setOpcionesVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
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

  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 20,
    textAlign: 'center',
  },

  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
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
  },

  rutinasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  },

  rutinaSubTexto: {
    fontSize: 12,
    color: '#fff',
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
    backgroundColor: '#f7f7f7',
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
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
