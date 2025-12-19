
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

import colors from './colors';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para modal y campos de edición
  const [modalVisible, setModalVisible] = useState(false);
  const [pesoInput, setPesoInput] = useState('');
  const [alturaInput, setAlturaInput] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let nombreUser = 'Usuario';
          let emailUser = firebaseUser.email || 'email@example.com';
          let pesoGuardado = '80';
          let alturaGuardada = '1.9';
          let documentId = null;  // ID real del documento en Firestore

          // Obtener datos del backend buscando por email (como WelcomeScreen)
          try {
            const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const resp = await axios.get(
              `http://${host}:8082/api/usuarios/buscar/email/${encodeURIComponent(firebaseUser.email)}`,
              { timeout: 5000 }
            );

            if (resp.data) {
              nombreUser = resp.data.nombre || nombreUser;
              emailUser = resp.data.email || emailUser;
              pesoGuardado = resp.data.weight || resp.data.peso || pesoGuardado;
              alturaGuardada = resp.data.height || resp.data.altura || alturaGuardada;
              documentId = resp.data.id || firebaseUser.uid;  // Obtener el ID real del documento

              // Guardar datos en localStorage
              await ReactNativeAsyncStorage.setItem('userName', nombreUser);
              await ReactNativeAsyncStorage.setItem('userEmail', emailUser);
              await ReactNativeAsyncStorage.setItem('userWeight', String(pesoGuardado));
              await ReactNativeAsyncStorage.setItem('userHeight', String(alturaGuardada));
              await ReactNativeAsyncStorage.setItem('userDocId', documentId);  // Guardar el ID real
            }
          } catch (e) {
            console.warn('No se pudo obtener datos del backend:', e?.message);
            documentId = firebaseUser.uid;
          }

          // Usar el ID real del documento
          setUserId(documentId || firebaseUser.uid);

          const userData = {
            nombre: nombreUser,
            email: emailUser,
            avatar: require('../assets/avatar.png'),
            peso: pesoGuardado ? parseFloat(String(pesoGuardado)) : 80,
            altura: alturaGuardada ? parseFloat(String(alturaGuardada)) : 1.9,
            registros: [
              { tipo: 'Ejercicio', detalle: '30 min de cardio', fecha: '22/10/2025' },
              { tipo: 'Alimentación', detalle: 'Desayuno saludable', fecha: '22/10/2025' },
              { tipo: 'Sueño', detalle: 'Dormido 7h 45min', fecha: '21/10/2025' },
            ],
          };

          setUser(userData);
        } catch (error) {
          console.error('Error cargando perfil:', error);
          setUser({
            nombre: 'Usuario',
            email: 'email@example.com',
            avatar: require('../assets/avatar.png'),
            peso: 80,
            altura: 1.9,
            registros: [
              { tipo: 'Ejercicio', detalle: '30 min de cardio', fecha: '22/10/2025' },
              { tipo: 'Alimentación', detalle: 'Desayuno saludable', fecha: '22/10/2025' },
              { tipo: 'Sueño', detalle: 'Dormido 7h 45min', fecha: '21/10/2025' },
            ],
          });
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const openEditModal = () => {
    if (!user) return;
    setPesoInput(String(user.peso));
    setAlturaInput(String(user.altura));
    setModalVisible(true);
  };

  const saveEdits = async () => {
    const newPeso = parseFloat(pesoInput.replace(',', '.'));
    const newAltura = parseFloat(alturaInput.replace(',', '.'));

    if (isNaN(newPeso) || isNaN(newAltura) || newPeso <= 0 || newAltura <= 0) {
      console.warn('Valores inválidos');
      alert('Por favor ingresa números válidos para peso y altura');
      return;
    }

    if (!userId) {
      alert('Error: No se pudo obtener tu ID de usuario');
      return;
    }

    setIsSaving(true);
    try {
      // Actualizar en el backend
      const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      const url = `http://${host}:8082/api/usuarios/${userId}`;

      console.log('Enviando petición a:', url);
      console.log('Datos:', { weight: newPeso, height: newAltura });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: newPeso,
          height: newAltura,
        }),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del backend:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // Actualizar en el estado local
      setUser((prev) =>
        prev ? { ...prev, peso: newPeso, altura: newAltura } : prev
      );

      // Guardar en AsyncStorage
      await ReactNativeAsyncStorage.setItem('userWeight', String(newPeso));
      await ReactNativeAsyncStorage.setItem('userHeight', String(newAltura));

      console.log('Peso y altura actualizados exitosamente');
      alert('¡Cambios guardados correctamente!');
    } catch (e) {
      console.error('Error guardando peso/altura:', e);
      alert(`Error al guardar los cambios: ${e.message}`);
    } finally {
      setIsSaving(false);
      setModalVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ef2b2d" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error cargando perfil</Text>
      </View>
    );
  }

  const imc = (user.peso / (user.altura * user.altura)).toFixed(1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabecera normal (no sticky) */}
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
        <Stat label="Peso" value={`${user.peso} kg`} />
        <Stat label="Altura" value={`${user.altura} m`} />
        <Stat label="IMC" value={imc} />
      </View>

      {/* Botón para abrir modal */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={openEditModal}
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
              value={pesoInput}
              onChangeText={setPesoInput}
              keyboardType="numeric"
              placeholder="Peso (kg)"
            />
            <TextInput
              style={styles.input}
              value={alturaInput}
              onChangeText={setAlturaInput}
              keyboardType="numeric"
              placeholder="Altura (m)"
            />

            <TouchableOpacity
              style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
              onPress={saveEdits}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#ddd', marginTop: 8 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.saveButtonText, { color: '#333' }]}>Cancelar</Text>
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