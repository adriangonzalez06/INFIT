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
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import colors from './colors';
import AppModal from './AppModal';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export default function ChangingPassword({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Modal state
  const [modal, setModal] = useState({ visible: false, type: 'info', title: '', message: '' });

  const showModal = (type, title, message) =>
    setModal({ visible: true, type, title, message });
  const hideModal = () => setModal(m => ({ ...m, visible: false }));

  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        setDarkMode(savedTheme === 'true');
      };
      loadTheme();
    }, [])
  );

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showModal('warning', 'Campos incompletos', 'Por favor, rellena todos los campos.');
      return;
    }

    if (newPassword.length < 8) {
      showModal('error', 'Contraseña débil', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal('error', 'No coinciden', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      showModal('error', 'Sin sesión', 'No hay sesión activa. Vuelve a iniciar sesión.');
      return;
    }

    setLoading(true);
    try {
      // Re-autenticar al usuario antes de cambiar la contraseña
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Actualizar la contraseña
      await updatePassword(currentUser, newPassword);

      showModal('success', '¡Éxito!', 'Tu contraseña ha sido actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('[ChangingPassword] Error:', error);
      let message = 'No se pudo cambiar la contraseña. Inténtalo de nuevo.';

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'La contraseña actual no es correcta.';
      } else if (error.code === 'auth/weak-password') {
        message = 'La nueva contraseña es muy débil.';
      } else if (error.code === 'auth/requires-recent-login') {
        message = 'Por seguridad, debes cerrar sesión y volver a entrar para realizar este cambio.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Sin conexión a Internet. Verifica tu red.';
      }

      showModal('error', 'Error', message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = darkMode;

  return (
    <>
      <View style={[styles.safeArea, isDark && styles.darkSafeArea]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.title, isDark && styles.darkText]}>Nueva contraseña</Text>
            </View>

            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
                <Ionicons name="lock-closed-outline" size={60} color={colors.primary} />
              </View>
            </View>

            <Text style={[styles.subtitle, isDark && styles.darkTextSecondary]}>
              Tu seguridad es nuestra prioridad. Introduce tu contraseña actual seguida de la nueva.
            </Text>

            <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
              <Ionicons name="key-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.darkText]}
                placeholder="Contraseña actual"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
              <Ionicons name="lock-open-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.darkText]}
                placeholder="Nueva contraseña"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.darkText]}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPasswords}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPasswords(v => !v)} style={styles.eyeButton}>
                <Ionicons name={showPasswords ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDark ? '#aaa' : '#666'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.infoBox, isDark && styles.darkInfoBox]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.infoText, isDark && styles.darkTextSecondary]}>
                El cambio será inmediato una vez confirmes tu contraseña actual. No olvides tu nueva clave.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Actualizar contraseña</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.returnLink} onPress={() => navigation.goBack()}>
              <Text style={styles.returnLinkText}>Cancelar</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText="Entendido"
        onConfirm={() => {
          hideModal();
          if (modal.type === 'success') navigation.goBack();
        }}
        darkMode={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg_gray },
  darkSafeArea: { backgroundColor: '#121212' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 30 },
  backButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', flex: 1, marginRight: 40, textAlign: 'center', letterSpacing: -0.5 },
  darkText: { color: '#fff' },
  darkTextSecondary: { color: '#aaa' },
  iconContainer: { marginTop: 10, marginBottom: 30, alignItems: 'center' },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
  },
  darkIconCircle: { backgroundColor: '#1e1e1e', elevation: 0, shadowOpacity: 0 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', width: '100%', height: 60,
    backgroundColor: '#f9f9f9', borderRadius: 15, paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#eee', marginBottom: 15,
  },
  darkInputWrapper: { backgroundColor: '#1e1e1e', borderColor: '#333' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  eyeButton: { padding: 4 },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3f3',
    borderRadius: 12, padding: 12, width: '100%', marginBottom: 25, borderWidth: 1, borderColor: '#fdd',
  },
  darkInfoBox: { backgroundColor: '#2a1a1a', borderColor: '#4a2020' },
  infoText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  button: {
    width: '100%', height: 60, backgroundColor: colors.primary, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3, marginBottom: 20,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  returnLink: { marginTop: 5, padding: 10 },
  returnLinkText: { color: colors.blue, fontSize: 15, fontWeight: '600' },
});
