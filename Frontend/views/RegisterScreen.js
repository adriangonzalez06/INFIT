import React, { useState, useMemo, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from './colors';
import MainTabs from './MainTabs';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import {
  getAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../firebaseConfig';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


function RegisterScreen({ navigation }) {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );


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
      username: usuario,
      email: email.trim(),
      password: password, // enviar texto si el backend lo va a hashear
    };

    try {
      // Ajustar host según plataforma/emulador
      const host =
        Platform.OS === 'android'
          ? '10.0.2.2' // Android emulator (AVD). Genymotion usar 10.0.3.2
          : 'localhost'; // iOS simulator o web
      // Si pruebas en un dispositivo físico, reemplaza host por la IP de tu PC, e.g. '192.168.1.42'
      const backendUrl = `http://${host}:8082/api/usuarios/POST`;

      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      const user = userCredential.user;
      console.log('Cuenta creada en Firebase:', user.uid);

      // Enviar datos al backend
      const resp = await axios.post(backendUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });


      // Verificar respuesta
      if (resp.status === 201 || resp.status === 200) {
        console.log('Datos guardados en la base de datos');
        setError('');
        //Recibimos la respuesta del servidor (id del usuario para despues sacara el nombre)
        const idUser = resp.data?.id;
        const streakVal = 0;
        if (idUser) {
          //Y la guardamos en el local de la aplicacion
          await AsyncStorage.setItem('userId', idUser);
          await AsyncStorage.setItem('streak', streakVal.toString());
          console.log('userId guardado en AsyncStorage:', idUser, streakVal);
        }
        navigation.navigate('MainTabs')
      } else {
        // Si la creación en el backend falla, eliminar el usuario de Firebase para no dejar huérfano
        await user.delete();
        throw new Error('No se pudo crear el usuario en el backend, por favor vuelva a intentarlo.');
      }

    } catch (error) {
      // Mejor logging para diagnosticar Network Error
      console.error('Error al registrar:', error?.message || error);
      console.error('Axios error details:', error?.toJSON ? error.toJSON() : error);
      if (error?.response) {
        console.error('Backend response:', error.response.status, error.response.data);
      } else {
        console.error('No response from backend (network/cors/firewall/host issue).');
      }

      Alert.alert('Error', error?.message || 'Error al registrar');

      // Rollback: intentar eliminar usuario de Firebase si existe
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
          console.warn('Rollback: Usuario de Firebase eliminado debido a error en backend.');
        } catch (e) {
          console.warn('No se pudo eliminar el usuario de Firebase durante el rollback:', e?.message || e);
        }
      }
    }
  };

  return (
    <View style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
      <StatusBar style={darkMode ? "light" : "auto"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
            </TouchableOpacity>
            <Text style={[styles.title, darkMode && styles.darkText]}>Crear cuenta</Text>
          </View>

          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Nombre completo"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Correo electrónico"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Nombre de usuario"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            value={usuario}
            onChangeText={setUsuario}
          />
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Contraseña"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Confirmar contraseña"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.boton} onPress={(handleRegister)}>
            <Text style={styles.botonTexto}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonSecundario} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.botonTextoSecundario}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg_gray,
  },
  darkSafeArea: {
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Para compensar el espacio de la flecha y que el texto quede centrado
  },
  darkText: {
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
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
  darkInput: {
    backgroundColor: '#1e1e1e',
    borderColor: '#444',
    color: '#fff',
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
    fontSize: 16,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#ef2b2d',
  },
  botonTextoSecundario: {
    color: '#ef2b2d',
    fontWeight: '700',
    fontSize: 15,
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