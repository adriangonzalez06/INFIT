import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  getAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      // 🔑 Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const uid = user.uid;

      console.log('✅ Login exitoso, UID:', uid);

      // 🔄 Obtener datos del usuario de Firestore (nombre, etc)
      const host =
        Platform.OS === 'android'
          ? '10.0.2.2'
          : 'localhost';
      const backendUrl = `http://${host}:8082/api/usuarios/${uid}`;

      const userDataResp = await axios.get(backendUrl, {
        timeout: 10000,
      });

      const userData = userDataResp.data;
      const userName = userData.nombre || 'Usuario';

      // Obtener el ID Token para usar en peticiones al backend
      const idToken = await user.getIdToken();

      // Guardar datos localmente
      await ReactNativeAsyncStorage.setItem('userUID', uid);
      await ReactNativeAsyncStorage.setItem('userName', userName);
      await ReactNativeAsyncStorage.setItem('userEmail', email.trim());
      await ReactNativeAsyncStorage.setItem('idToken', idToken);

      setError('');
      Alert.alert('Éxito', 'Sesión iniciada correctamente');
      
      // Navegar a la pantalla principal
      navigation.navigate('MainTabs');

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error?.message || error);
      
      if (error?.code === 'auth/user-not-found') {
        setError('Usuario no encontrado');
      } else if (error?.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta');
      } else if (error?.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else {
        setError(error?.message || 'Error al iniciar sesión');
      }
      
      Alert.alert('Error', error?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar style="auto" />

          {/* Logo */}
          <Image
            style={styles.logo}
            source={require('../assets/logos/logo_white_bg.svg')}
          />

          <Text style={styles.title}>Iniciar sesión</Text>

          {/* Input Email */}
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Input Password */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {/* Error message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Login button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.subtitle}>----- O inicia sesión con -----</Text>

          {/* Sign up link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>

          {/* Forgot password link */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eeeeeeff',
  },
  container: {
    flex: 1,
    backgroundColor: '#eeeeeeff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    margin: 12,
    padding: 10,
    width: '100%',
    maxWidth: 300,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    color: '#8a8a8aff',
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  error: {
    color: '#ef2b2d',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});