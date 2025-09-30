import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';

const objetivos = ['Perder peso', 'Ganar músculo', 'Mantenerme'];

const ProfileScreen = () => {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const validarFecha = (text) => {
    setFechaNacimiento(text); // permite escribir libremente
  };


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            source={require('../assets/avatar.png')} // usa tu imagen o una por defecto
            style={styles.avatar}
          />
          <Text style={styles.editPhoto}>Cambiar foto</Text>
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput
            style={styles.input}
            value={fechaNacimiento}
            onChangeText={validarFecha}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers"

          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Sexo</Text>
          <View style={styles.sexoContainer}>
            <TouchableOpacity
              style={[styles.sexoBtn, sexo === 'Hombre' && styles.sexoActivo]}
              onPress={() => setSexo('Hombre')}
            >
              <Text>Hombre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexoBtn, sexo === 'Mujer' && styles.sexoActivo]}
              onPress={() => setSexo('Mujer')}
            >
              <Text>Mujer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Peso y Altura</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={peso}
              onChangeText={setPeso}
              keyboardType="numeric"
              placeholder="Peso"
            />
            <Text style={styles.unit}>kg</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={altura}
              onChangeText={setAltura}
              keyboardType="numeric"
              placeholder="Altura"
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Objetivo</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectText}>
              {objetivo || 'Selecciona un objetivo...'}
            </Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {objetivos.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.modalOption}
                    onPress={() => {
                      setObjetivo(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        </View>

        <TouchableOpacity style={styles.boton}>
          <Text style={styles.botonTexto}>Guardar perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dddbd1', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  editPhoto: {
    marginTop: 8,
    color: '#007AFF',
    fontSize: 14,
  },
  field: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  inputSmall: {
    width: 80,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: { marginHorizontal: 5, fontSize: 14 },
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sexoBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sexoActivo: { backgroundColor: '#fdd' },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#111',
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
