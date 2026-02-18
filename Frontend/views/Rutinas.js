import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../src/components/Header';
import { StatusBar } from 'expo-status-bar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
            const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const resp = await axios.get(
              `http://${host}:8082/api/usuarios/buscar/email/${encodeURIComponent(firebaseUser.email)}`,
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
      id: Date.now().toString(),
      nombre: nombreRutina.trim(),
      ejercicios: sugerencias,
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

  const handleEntrarRutina = (rutina, grupoKey) => {
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

  const renderGrupo = (titulo, rutinasGrupo, grupoKey) => {
    return (
      <View style={styles.grupoContainer}>
        <Text style={styles.grupoTitulo}>{titulo}</Text>
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
        {(rutinas.predefinidas || rutinasPredefinidas).map((rutina) => (
          <TouchableOpacity
            key={rutina.id}
            style={[styles.rutinaCard, { backgroundColor: rutina.color }]}
            onPress={() => handleEntrarRutina(rutina, 'predefinidas')}
            onLongPress={() => handleLongPress(rutina)}
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
      <StatusBar style="auto" />
      <Header title="Rutinas" showBackButton={false} />

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hola {userName || 'usuario'},</Text>
        <Text style={styles.subGreetingText}>¿listo para entrenar?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones</Text>
            <TouchableOpacity onPress={() => {
              if (rutinaSeleccionada) handleEntrarRutina(rutinaSeleccionada, 'grupo1');
            }}>
              <Text style={styles.modalButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDuplicarRutina}>
              <Text style={styles.modalButtonText}>Duplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEliminarRutina}>
              <Text style={styles.modalButtonText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpcionesVisible(false)}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
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
});