import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AppModal from './AppModal';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import colors from './colors';
import { BACKEND_URL } from '../src/config';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [modal, setModal] = useState({ visible: false, type: 'info', title: '', message: '' });
  const showModal = (type, title, message) => setModal({ visible: true, type, title, message });
  const hideModal = () => setModal(m => ({ ...m, visible: false }));

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
      showModal('warning', 'Campos incompletos', 'Por favor, rellena todos los campos del formulario.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      showModal('error', 'Las contraseñas no coinciden', 'Asegúrate de que ambas contraseñas sean iguales.');
      return;
    }

    const payload = {
      nombre,
      username: usuario,
      email: email.trim(),
      password: password, // enviar texto si el backend lo va a hashear
    };

    try {
      const backendUrl = `${BACKEND_URL}/api/usuarios/POST`;

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
      console.error('Error al registrar:', error?.message || error);
      showModal('error', 'Error al registrar', error?.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.');

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.delete();
        } catch (e) {
          console.warn('Rollback failed:', e?.message || e);
        }
      }
    } finally {
      setSubmitting(false);
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, darkMode && styles.darkText]}>Crear cuenta</Text>
              <Text style={[styles.subtitle, darkMode && styles.darkSubtitle]}>Únete a la familia INFIT</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, darkMode && styles.darkInputContainer]}>
              <Ionicons name="person-outline" size={20} color={darkMode ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Nombre completo"
                placeholderTextColor={darkMode ? "#666" : "#999"}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={[styles.inputContainer, darkMode && styles.darkInputContainer]}>
              <Ionicons name="at-outline" size={20} color={darkMode ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Nombre de usuario"
                placeholderTextColor={darkMode ? "#666" : "#999"}
                value={usuario}
                onChangeText={setUsuario}
              />
            </View>

            <View style={[styles.inputContainer, darkMode && styles.darkInputContainer]}>
              <Ionicons name="mail-outline" size={20} color={darkMode ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                placeholder="Correo electrónico"
                placeholderTextColor={darkMode ? "#666" : "#999"}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, darkMode && styles.darkInputContainer]}>
              <Ionicons name="lock-closed-outline" size={20} color={darkMode ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, darkMode && styles.darkInput, { flex: 1 }]}
                placeholder="Contraseña"
                placeholderTextColor={darkMode ? "#666" : "#999"}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={darkMode ? "#aaa" : "#888"} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, darkMode && styles.darkInputContainer]}>
              <Ionicons name="lock-closed-outline" size={20} color={darkMode ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, darkMode && styles.darkInput, { flex: 1 }]}
                placeholder="Confirmar contraseña"
                placeholderTextColor={darkMode ? "#666" : "#999"}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={darkMode ? "#aaa" : "#888"} />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.boton, submitting && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonTexto}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonSecundario} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.botonTextoSecundario}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText="Entendido"
        onConfirm={hideModal}
        darkMode={darkMode}
      />
    </View>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkSafeArea: {
    backgroundColor: colors.bg_dark,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
    minHeight: 60,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  darkSubtitle: {
    color: '#aaa',
  },
  darkText: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    height: 56,
  },
  darkInputContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    height: '100%',
  },
  darkInput: {
    color: '#fff',
  },
  boton: {
    backgroundColor: '#ef2b2d',
    height: 56,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef2b2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  botonSecundario: {
    marginTop: 24,
    alignItems: 'center',
  },
  botonTextoSecundario: {
    color: '#ef2b2d',
    fontWeight: '600',
    fontSize: 14,
  },
  error: {
    color: '#ef2b2d',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});