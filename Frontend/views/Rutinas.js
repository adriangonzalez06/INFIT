import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform, SafeAreaView, useColorScheme
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../src/components/Header';
import { StatusBar } from 'expo-status-bar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { BACKEND_URL } from '../src/config';
import colors from './colors';


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

  const colorScheme = useColorScheme();
  const darkMode = colorScheme === 'dark';

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
        <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>{titulo}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >

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
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {(predefinidas.length > 0 ? predefinidas : rutinasPredefinidas).map((rutina) => (

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
      <StatusBar style={darkMode ? "light" : "auto"} />

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
            <View style={styles.bottomSheetIndicator} />
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Crear rutina</Text>
            <TextInput
              style={[styles.input, darkMode && { borderColor: '#444', backgroundColor: colors.bg_dark, color: '#fff' }]}

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
            <View style={styles.bottomSheetIndicator} />
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Opciones de rutina</Text>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                if (rutinaSeleccionada) handleEntrarRutina(rutinaSeleccionada, 'grupo1');
                setOpcionesVisible(false);
              }}
            >
              <Ionicons name="create-outline" size={22} color={darkMode ? "#ccc" : "#333"} />
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333' }]}>Editar rutina</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleDuplicarRutina}>
              <Ionicons name="copy-outline" size={22} color={darkMode ? "#ccc" : "#333"} />
              <Text style={[styles.modalButtonText, { color: darkMode ? '#ccc' : '#333' }]}>Duplicar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleEliminarRutina}>
              <Ionicons name="trash-outline" size={22} color="#ef2b2d" />
              <Text style={[styles.modalButtonText, { color: '#ef2b2d' }]}>Eliminar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: darkMode ? '#333' : '#eee', marginTop: 20, flex: 0 }]}
              onPress={() => setOpcionesVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: darkMode ? '#888' : '#666' }]}>Cerrar</Text>

            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
    borderTopColor: '#333',
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
    width: 160,
    height: 180,
    borderRadius: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 20,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
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
    width: 160,
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    marginHorizontal: 5,
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
});