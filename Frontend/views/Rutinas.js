// Rutinas.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Rutinas() {
  const navigation = useNavigation();
  const [rutinas, setRutinas] = useState({
    grupo1: [],
    grupo2: [],
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [nombreRutina, setNombreRutina] = useState('');

  const handleAddRutina = (grupo) => {
    setGrupoActivo(grupo);
    setModalVisible(true);
  };

  const handleGuardarRutina = () => {
    if (!nombreRutina.trim()) return;

    const nuevaRutina = {
      id: Date.now().toString(),
      nombre: nombreRutina.trim(),
      ejercicios: [], // ← Aquí se guardarán los ejercicios
    };

    setRutinas((prev) => ({
      ...prev,
      [grupoActivo]: [...prev[grupoActivo], nuevaRutina],
    }));

    setNombreRutina('');
    setModalVisible(false);
  };

  const handleEntrarRutina = (rutina, grupoKey) => {
    navigation.navigate('PantallaRutina', {
      rutina,
      grupoKey,
      actualizarRutina: (rutinaActualizada) => {
        setRutinas((prev) => ({
          ...prev,
          [grupoKey]: prev[grupoKey].map((r) =>
            r.id === rutinaActualizada.id ? rutinaActualizada : r
          ),
        }));
      },
    });
  };

  const renderGrupo = (titulo, rutinasGrupo, grupoKey) => (
    <View style={styles.grupoContainer}>
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      <View style={styles.rutinasRow}>
        {rutinasGrupo.map((rutina) => (
          <TouchableOpacity
            key={rutina.id}
            style={styles.rutinaCard}
            onPress={() => handleEntrarRutina(rutina, grupoKey)}
          >
            <Text style={styles.rutinaTexto}>{rutina.nombre}</Text>
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

  return (
    <View style={styles.container}>
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
    </TouchableOpacity>
      <Text style={styles.title}>Mis rutinas</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderGrupo('Grupo muscular 1', rutinas.grupo1, 'grupo1')}
        {renderGrupo('Grupo muscular 2', rutinas.grupo2, 'grupo2')}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nombre de la rutina</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Piernas explosivas"
              value={nombreRutina}
              onChangeText={setNombreRutina}
            />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 20,
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
    width: 100,
    height: 100,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rutinaTexto: {
    fontSize: 14,
    color: '#111114',
    textAlign: 'center',
  },
  addCard: {
    width: 100,
    height: 100,
    borderRadius: 10,
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111114',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
