import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import colors from './colors';
import AppModal from './AppModal';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [modal, setModal] = useState({ visible: false, type: 'info', title: '', message: '', highlight: '' });

  const showModal = (type, title, message, highlight = '') =>
    setModal({ visible: true, type, title, message, highlight });
  const hideModal = (andGoBack = false) => {
    setModal(m => ({ ...m, visible: false }));
    if (andGoBack) navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        setDarkMode(savedTheme === 'true');
      };
      loadTheme();
    }, [])
  );

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      showModal('warning', 'Campo vacío', 'Por favor, introduce tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showModal('success', '¡Enlace enviado!', 'Hemos enviado las instrucciones de recuperación a:', email.trim());
      setEmail('');
    } catch (error) {
      console.error(error);
      let message = 'No se pudo enviar el correo. Verifica que la dirección sea correcta.';
      if (error.code === 'auth/user-not-found') {
        message = 'No existe ninguna cuenta asociada a este correo electrónico.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El formato del correo no es válido.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Sin conexión a Internet. Verifica tu red e inténtalo de nuevo.';
      }
      showModal('error', 'No se pudo enviar', message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = darkMode;

  return (
    <>
      <View style={[styles.safeArea, isDark && styles.darkSafeArea]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.title, isDark && styles.darkText]}>Recuperar cuenta</Text>
            </View>

            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
                <Ionicons name="lock-open-outline" size={60} color={colors.primary} />
              </View>
            </View>

            <Text style={[styles.subtitle, isDark && styles.darkTextSecondary]}>
              No te preocupes. Introduce tu email y te enviaremos las instrucciones para restablecerla.
            </Text>

            <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
              <Ionicons name="mail-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.darkText]}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDark ? '#666' : '#999'}
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

      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        highlight={modal.highlight}
        confirmText="Entendido"
        onConfirm={() => hideModal(modal.type === 'success')}
        darkMode={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg_gray },
  darkSafeArea: { backgroundColor: '#121212' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  backButton: { padding: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 30 },
  iconContainer: { marginTop: 40, marginBottom: 30, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
  },
  darkIconCircle: { backgroundColor: '#1e1e1e', elevation: 0, shadowOpacity: 0 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', flex: 1, marginRight: 40, letterSpacing: -0.5 },
  darkText: { color: '#fff' },
  darkTextSecondary: { color: '#aaa' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 10 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', width: '100%', height: 60,
    backgroundColor: '#f9f9f9', borderRadius: 15, paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#eee', marginBottom: 25,
  },
  darkInputWrapper: { backgroundColor: '#1e1e1e', borderColor: '#333' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  button: {
    width: '100%', height: 60, backgroundColor: colors.primary, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3, marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  returnLogin: { marginTop: 10, padding: 10 },
  returnLoginText: { color: colors.blue, fontSize: 15, fontWeight: '600' },
});
