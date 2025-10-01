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

export default function PantallaRutina({ route, navigation }) {
  const { rutina, grupoKey, actualizarRutina } = route.params;
  const [ejercicios, setEjercicios] = useState(rutina.ejercicios || []);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [filtro, setFiltro] = useState('');

  const ejerciciosPredefinidos = {
    piernas: ['Sentadillas', 'Prensa', 'Zancadas', 'Peso muerto rumano'],
    pecho: ['Press banca', 'Aperturas', 'Fondos', 'Press inclinado'],
    espalda: ['Dominadas', 'Remo con barra', 'Peso muerto'],
    hombros: ['Press militar', 'Elevaciones laterales', 'Pájaros'],
    brazos: ['Curl bíceps', 'Extensión tríceps', 'Martillo'],
  };

  const handleAddEjercicio = (nombreEjercicio) => {
    const nuevoEjercicio = {
      id: Date.now().toString(),
      nombre: nombreEjercicio.trim(),
    };
    const nuevaLista = [...ejercicios, nuevoEjercicio];
    setEjercicios(nuevaLista);
    actualizarRutina({ ...rutina, ejercicios: nuevaLista });
    setBuscadorVisible(false);
    setFiltro('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={styles.title}>{rutina.nombre}</Text>
        <TouchableOpacity onPress={() => setBuscadorVisible(true)}>
          <Ionicons name="search" size={24} color="#ef2b2d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ejercicios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ejercicioItem}>
            <Text style={styles.ejercicioTexto}>{item.nombre}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay ejercicios añadidos aún.</Text>}
      />

      {/* Modal buscador */}
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
                    .filter((ej) => ej.toLowerCase().includes(filtro.toLowerCase()))
                    .map((ejercicio) => (
                      <TouchableOpacity
                        key={ejercicio}
                        style={styles.ejercicioItemModal}
                        onPress={() => handleAddEjercicio(ejercicio)}
                      >
                        <Text>{ejercicio}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setBuscadorVisible(false)} style={styles.cerrar}>
              <Text style={styles.cerrarTexto}>Cerrar</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef2b2d',
  },
  ejercicioItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#ef2b2d',
  },
  ejercicioItemModal: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cerrar: {
    marginTop: 10,
    alignSelf: 'center',
  },
  cerrarTexto: {
    color: '#ef2b2d',
    fontWeight: '600',
  },
});
