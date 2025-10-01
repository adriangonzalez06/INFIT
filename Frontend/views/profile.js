import axios from 'axios';
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

const valorInicial = {
nombre: '',
fechadenacimiento: '',
sexo: '',
peso: '',
altura: '',
objetivo: '',
correo: '',
contraseña: ''
};

const [usuario, setUsuario] = useState(valorInicial);

const capturarDatos = (campo) => (valor) => {
    setUsuario((prevUsuario) => ({ ...prevUsuario, [campo]: valor}));
};

const guardarDatos = async () => {

try {
    console.log('Datos del usaurio', usuario);

    //Crear la logica para la peticion POST

    const newUser = {
        nombre: usuario.nombre,
        fechadenacimiento: usuario.fechadenacimiento,
        sexo:usuario.sexo,
        peso: usuario.peso,
        altura: usuario.altura,
        objetivo: usuario.objetivo

    };



    await axios.post('http://10.0.2.2:8082/api/usuarios', newUser);

    setUsuario({...valorInicial});

} catch(error){
    console.error('Error al guardar los datos:', error.message);
};
};


  const [modalVisible, setModalVisible] = useState(false);


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
          <TextInput style={styles.input} value={usuario.nombre} onChangeText={capturarDatos('nombre')} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput
            style={styles.input}
            value={usuario.fechadenacimiento}
            onChangeText={capturarDatos('fechadenacimiento')}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers"

          />
        </View>

          <Text style={styles.label}>Sexo</Text>
        <View style={styles.field}>
          <View style={styles.sexoContainer}>
            <TouchableOpacity
              style={[styles.sexoBtn, usuario.sexo === 'Hombre' && styles.sexoActivo]}
              onPress={() => setUsuario({ ...usuario, sexo: 'Hombre'})}
            >
              <Text>Hombre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexoBtn, usuario.sexo === 'Mujer' && styles.sexoActivo]}
              onPress={() => setUsuario({ ...usuario, sexo: 'Mujer'})}
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
              value={usuario.peso}
              onChangeText={capturarDatos('peso')}
              keyboardType="numeric"
              placeholder="Peso"
            />
            <Text style={styles.unit}>kg</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={usuario.altura}
              onChangeText={capturarDatos('altura')}
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
              {usuario.objetivo || 'Selecciona un objetivo...'}
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
                      setUsuario({ ...usuario, objetivo: item});
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

        <TouchableOpacity style={styles.boton} onPress={guardarDatos}>
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
