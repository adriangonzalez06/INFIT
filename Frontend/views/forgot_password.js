import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import colors from './colors';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Ups...', 'Por favor, introduce tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        '¡Listo!',
        `Te hemos enviado un enlace de recuperación a:\n${email}`,
        [
          {
            text: 'Entendido',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      setEmail('');
    } catch (error) {
      console.error(error);
      let message = 'No se pudo enviar el correo. Verifica que la dirección sea correcta.';
      if (error.code === 'auth/user-not-found') {
        message = 'No existe ninguna cuenta asociada a este correo.';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.safeArea, darkMode && styles.darkSafeArea]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, darkMode && styles.darkText]}>Recuperar cuenta</Text>
          </View>

          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, darkMode && styles.darkIconCircle]}>
              <Ionicons name="lock-open-outline" size={60} color={colors.primary} />
            </View>
          </View>

          <Text style={[styles.subtitle, darkMode && styles.darkTextSecondary]}>
            No te preocupes. Introduce tu email y te enviaremos las instrucciones para restablecerla.
          </Text>

          <View style={[styles.inputWrapper, darkMode && styles.darkInputWrapper]}>
            <Ionicons name="mail-outline" size={20} color={darkMode ? "#aaa" : "#666"} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, darkMode && styles.darkText]}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={darkMode ? "#666" : "#999"}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar enlace'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.returnLogin} onPress={() => navigation.goBack()}>
            <Text style={styles.returnLoginText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg_gray,
  },
  darkSafeArea: {
    backgroundColor: '#121212',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  darkIconCircle: {
    backgroundColor: '#1e1e1e',
    elevation: 0,
    shadowOpacity: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // Para compensar el espacio de la flecha y que el texto quede centrado
    letterSpacing: -0.5,
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 60,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 25,
  },
  darkInputWrapper: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  returnLogin: {
    marginTop: 10,
    padding: 10,
  },
  returnLoginText: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '600',
  },
});


