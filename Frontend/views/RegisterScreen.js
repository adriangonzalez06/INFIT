import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
const axios = require('axios'); // o import axios from 'axios';

import {
  getAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


function RegisterScreen({ navigation }) {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');


  const handleRegister = async () => {
    setError('');
    // Validar campos
    if (!nombre || !email || !usuario || !password) {
      setError('Por favor, completa todos los campos.');
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    const payload = {
      nombre,
      correo: email.trim(),
      usuario,
      contraseña: password, // enviar texto si el backend lo va a hashear
    };

    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      console.log('Cuenta creada en Firebase:', user.uid);

      // Crear el bojeto usuario para el backend
      //Enviar datos al backend
      const resp = await axios.post('http://localhost:8082/api/usuarios', payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      //Verificar respuesta
      if (resp.status === 201 || resp.status === 200) {
        console.log('Datos guardados en la base de datos');
        setError('');
        navigation.navigate('Login');
      } else {
        // Si la creación en el backend falla, eliminar el usuario de Firebase par ano dejar fuerfano 
        await user.delete();
        throw new Error('No se pudo crear el usuario, porfabor vuelva a intentarlo.');
      }
      

      
    } catch (error) {
      // Manejar errores de Firebase o del backend
      console.error('Error al registrar:', error.message);
      Alert.alert('Error', error.message);

      // Si hubo un error, eliminar el usuario de Firebase para evitar inconsistencias
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
          console.warn('Rollback: Usuario de Firebase eliminado debido a error en backend.');
        }catch (e){
          console.warn('No se pudo eliminar el usuario de Firebase durante el rollback:', e?.message || e);
        }
        
      }
    }
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
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.boton} onPress={handleRegister}>
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