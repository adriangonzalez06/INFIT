import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';

export default function PantallaRutina({ route, navigation }) {
  const { rutina, grupoKey, actualizarRutina } = route.params;
  const [ejercicios, setEjercicios] = useState(rutina.ejercicios || []);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [filtro, setFiltro] = useState('');

  // Estado del menú bonito
  const [opcionesVisible, setOpcionesVisible] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);

  // Animaciones Lottie
  const ejerciciosPredefinidos = {
    piernas: [
      {
        nombre: 'Sentadilla',
        animacion: require('../assets/ejercicios/sentadilla.json'),
      },
    ],
  };

  // Añadir ejercicio con animación incluida
  const handleAddEjercicio = (ejercicioObj) => {
    const nuevoEjercicio = {
      id: Date.now().toString(),
      nombre: ejercicioObj.nombre,
      animacion: ejercicioObj.animacion,
    };

    const nuevaLista = [...ejercicios, nuevoEjercicio];
    setEjercicios(nuevaLista);
    actualizarRutina({ ...rutina, ejercicios: nuevaLista });
    setBuscadorVisible(false);
    setFiltro('');
  };

  return (
    <View style={styles.rutinaContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={styles.title}>{rutina.nombre}</Text>
        <TouchableOpacity onPress={() => setBuscadorVisible(true)}>
          <Ionicons name="search" size={24} color="#ef2b2d" />
        </TouchableOpacity>
      </View>

      {/* LISTA DE EJERCICIOS */}
      <FlatList
      contentContainerStyle={{ paddingTop: 0}}
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
              {item.animacion && (
                <LottieView
                  source={item.animacion}
                  autoPlay
                  loop
                  style={styles.iconoGif}
                />
              )}
              <Text style={styles.ejercicioTexto}>{item.nombre}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay ejercicios añadidos aún.</Text>
        }
      />

      {/* MODAL BUSCADOR */}
      <Modal visible={buscadorVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.buscadorContainer}>
            <TextInput
              style={styles.input}
              placeholder="Buscar ejercicio..."
              value={filtro}
              onChangeText={setFiltro}
            />

            <ScrollView>
              {Object.entries(ejerciciosPredefinidos).map(([grupo, lista]) => (
                <View key={grupo}>
                  <Text style={styles.grupoTitulo}>{grupo.toUpperCase()}</Text>

                  {lista
                    .filter((ej) =>
                      ej.nombre.toLowerCase().includes(filtro.toLowerCase())
                    )
                    .map((ejercicio) => (
                      <TouchableOpacity
                        key={ejercicio.nombre}
                        style={styles.ejercicioItemModal}
                        onPress={() => handleAddEjercicio(ejercicio)}
                      >
                        <View style={styles.row}>
                          <LottieView
                            source={ejercicio.animacion}
                            autoPlay
                            loop
                            style={styles.iconoGif}
                          />
                          <Text>{ejercicio.nombre}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setBuscadorVisible(false)}
              style={styles.cerrar}
            >
              <Text style={styles.cerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL BONITO DE OPCIONES */}
      <Modal visible={opcionesVisible} transparent animationType="fade">
        <View style={styles.optionsOverlay}>
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>Opciones del ejercicio</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setOpcionesVisible(false);
              }}
            >
              <Ionicons name="create-outline" size={22} color="#ef2b2d" />
              <Text style={styles.optionText}>Editar ejercicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setOpcionesVisible(false);
                const copia = {
                  ...ejercicioSeleccionado,
                  id: Date.now().toString(),
                };
                setEjercicios([...ejercicios, copia]);
              }}
            >
              <Ionicons name="copy-outline" size={22} color="#ef2b2d" />
              <Text style={styles.optionText}>Duplicar ejercicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.deleteButton]}
              onPress={() => {
                setOpcionesVisible(false);
                setEjercicios(
                  ejercicios.filter((e) => e.id !== ejercicioSeleccionado.id)
                );
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#fff" />
              <Text style={[styles.optionText, { color: '#fff' }]}>
                Eliminar ejercicio
              </Text>
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

/* ===================== ESTILOS ===================== */

const styles = StyleSheet.create({
  rutinaContainer: {
    flex: 1,
    paddingTop: 60,
    marginTop: 20,
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
  ejercicioTexto: {
    fontSize: 16,
    color: '#111',
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

  /* MODAL BONITO */
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
