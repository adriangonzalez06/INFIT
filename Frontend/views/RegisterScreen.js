import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

function RegisterScreen({ navigation }) {

const capturarDatos = (campo) => (valor) => {
    setUsuario((prevUsuario) => ({ ...prevUsuario, [campo]: valor}));
};

const valorInicial_registro = {
nombre: '',
email: '',
usuario: '',
confirmPassword: '',
};

const [error, setError] = useState('');

const [usuario, setUsuario] = useState(valorInicial_registro);

  const handleRegister = () => {
    if (!usuario.nombre || !usuario.email || !usuario.usuario || !usuario.password || !usuario.confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (usuario.password !== usuario.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    navigation.navigate('Verificacion');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Crear cuenta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={usuario.nombre}
            onChangeText={capturarDatos('nombre')}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            value={usuario.email}
            onChangeText={capturarDatos('email')}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            value={usuario.usuario}
            onChangeText={capturarDatos('usuario')}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={usuario.password}
            onChangeText={capturarDatos('password')}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={usuario.confirmPassword}
            onChangeText={capturarDatos('confirmPassword')}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.botonTexto}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#dddbd1',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  error: {
    color: '#ef2b2d',
    marginTop: 10,
    textAlign: 'center',
  },
});
