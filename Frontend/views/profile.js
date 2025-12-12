
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from './colors';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const user = {
    nombre: 'Sergi Velasco',
    avatar: require('../assets/avatar.png'),
    peso: 80,
    altura: 1.9,
    registros: [
      { tipo: 'Ejercicio', detalle: '30 min de cardio', fecha: '22/10/2025' },
      { tipo: 'Alimentación', detalle: 'Desayuno saludable', fecha: '22/10/2025' },
      { tipo: 'Sueño', detalle: 'Dormido 7h 45min', fecha: '21/10/2025' },
    ],
  };

  const [peso, setPeso] = useState(user.peso.toString());
  const [altura, setAltura] = useState(user.altura.toString());
  const [modalVisible, setModalVisible] = useState(false);

  const imc =
    parseFloat(altura) > 0
      ? (parseFloat(peso) / (parseFloat(altura) * parseFloat(altura))).toFixed(1)
      : '—';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContent}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Ajustes')}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={user.avatar} style={styles.avatarPerfil} />
        <Text style={styles.nombre}>{user.nombre}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Stat label="Peso" value={`${peso} kg`} />
        <Stat label="Altura" value={`${altura} m`} />
        <Stat label="IMC" value={imc} />
      </View>

      {/* Botón para abrir modal */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>

      {/* Modal para editar peso y altura */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar datos</Text>
            <TextInput
              style={styles.input}
              value={peso}
              onChangeText={setPeso}
              keyboardType="numeric"
              placeholder="Peso (kg)"
            />
            <TextInput
              style={styles.input}
              value={altura}
              onChangeText={setAltura}
              keyboardType="numeric"
              placeholder="Altura (m)"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Últimos registros</Text>
      {user.registros.map((registro, index) => (
        <View key={index} style={styles.registroBox}>
          <Text style={styles.registroTipo}>{registro.tipo}</Text>
          <Text style={styles.registroDetalle}>{registro.detalle}</Text>
          <Text style={styles.registroFecha}>{registro.fecha}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('RegistroNuevo')}
      >
        <Text style={styles.botonTexto}>Añadir nuevo registro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
    backgroundColor: '#f9f9f9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ef2b2d',
    marginBottom: 10,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  editButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
    
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
    paddingHorizontal: 20,
  },
  registroBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#ef2b2d',
  },
  registroTipo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  registroDetalle: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  registroFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
