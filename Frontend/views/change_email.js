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
    verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { BACKEND_URL } from '../src/config';
import colors from './colors';
import axios from 'axios';
import AppModal from './AppModal';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export default function ChangeEmailScreen({ navigation }) {
    const [newEmail, setNewEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Modal state
    const [modal, setModal] = useState({ visible: false, type: 'info', title: '', message: '', highlight: '' });
    const [successModal, setSuccessModal] = useState(false);
    const [confirmedEmail, setConfirmedEmail] = useState('');

    const showModal = (type, title, message, highlight = '') =>
        setModal({ visible: true, type, title, message, highlight });
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

    const handleChangeEmail = async () => {
        const trimmedNew = newEmail.trim().toLowerCase();
        const trimmedConfirm = confirmEmail.trim().toLowerCase();

        if (!trimmedNew || !trimmedConfirm || !password) {
            showModal('warning', 'Campos incompletos', 'Por favor, rellena todos los campos.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedNew)) {
            showModal('error', 'Correo inválido', 'Introduce una dirección de correo electrónico válida.');
            return;
        }

        if (trimmedNew !== trimmedConfirm) {
            showModal('error', 'Los correos no coinciden', 'El nuevo correo y su confirmación deben ser iguales.');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            showModal('error', 'Sin sesión', 'No hay sesión activa. Vuelve a iniciar sesión.');
            return;
        }

        if (trimmedNew === currentUser.email?.toLowerCase()) {
            showModal('info', 'Sin cambios', 'El nuevo correo es igual al correo actual de tu cuenta.');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, password);
            await reauthenticateWithCredential(currentUser, credential);
            await verifyBeforeUpdateEmail(currentUser, trimmedNew);

            let userId = await AsyncStorage.getItem('userId');
            if (!userId) userId = await AsyncStorage.getItem('userDocId');
            if (userId) {
                try {
                    await axios.put(`${BACKEND_URL}/api/usuarios/${userId}`, { email: trimmedNew }, { timeout: 8000 });
                    await AsyncStorage.setItem('userEmail', trimmedNew);
                } catch (backendErr) {
                    console.warn('[ChangeEmail] Error actualizando backend:', backendErr?.message);
                }
            }

            setConfirmedEmail(trimmedNew);
            setNewEmail('');
            setConfirmEmail('');
            setPassword('');
            setSuccessModal(true);

        } catch (error) {
            console.error('[ChangeEmail] Error:', error);
            let message = 'No se pudo cambiar el correo. Inténtalo de nuevo.';
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = 'La contraseña que introdujiste es incorrecta.';
            } else if (error.code === 'auth/email-already-in-use') {
                message = 'Ese correo ya está en uso por otra cuenta.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'El formato del correo no es válido.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.';
            } else if (error.code === 'auth/requires-recent-login') {
                message = 'Tu sesión ha expirado. Cierra sesión, vuelve a entrar e inténtalo de nuevo.';
            } else if (error.code === 'auth/network-request-failed') {
                message = 'Sin conexión a Internet. Verifica tu red y vuelve a intentarlo.';
            }
            showModal('error', 'No se pudo cambiar el correo', message);
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
                            <Text style={[styles.title, isDark && styles.darkText]}>Cambiar correo</Text>
                        </View>

                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
                                <Ionicons name="mail-outline" size={60} color={colors.primary} />
                            </View>
                        </View>

                        <Text style={[styles.subtitle, isDark && styles.darkTextSecondary]}>
                            Introduce tu nuevo correo y tu contraseña actual para confirmarlo. Te enviaremos un enlace de verificación.
                        </Text>

                        <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
                            <Ionicons name="mail-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, isDark && styles.darkText]}
                                placeholder="Nuevo correo electrónico"
                                placeholderTextColor={isDark ? '#666' : '#999'}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, isDark && styles.darkText]}
                                placeholder="Confirmar nuevo correo"
                                placeholderTextColor={isDark ? '#666' : '#999'}
                                value={confirmEmail}
                                onChangeText={setConfirmEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={[styles.inputWrapper, isDark && styles.darkInputWrapper]}>
                            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#aaa' : '#666'} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, isDark && styles.darkText]}
                                placeholder="Contraseña actual"
                                placeholderTextColor={isDark ? '#666' : '#999'}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeButton}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={isDark ? '#aaa' : '#666'} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.infoBox, isDark && styles.darkInfoBox]}>
                            <Ionicons name="information-circle-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.infoText, isDark && styles.darkTextSecondary]}>
                                El cambio no será efectivo hasta que verifiques el nuevo correo.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.7 }]}
                            onPress={handleChangeEmail}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.buttonText}>Cambiar correo</Text>
                            }
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.returnLink} onPress={() => navigation.goBack()}>
                            <Text style={styles.returnLinkText}>Cancelar</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            {/* Modal de validación / error */}
            <AppModal
                visible={modal.visible}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                highlight={modal.highlight}
                confirmText="Entendido"
                onConfirm={hideModal}
                darkMode={isDark}
            />

            {/* Modal de éxito personalizado — correo enviado */}
            <AppModal
                visible={successModal}
                type="success"
                title="¡Casi listo!"
                message="Hemos enviado un enlace de verificación a:"
                highlight={confirmedEmail}
                confirmText="Entendido"
                onConfirm={() => { setSuccessModal(false); navigation.goBack(); }}
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
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    returnLink: { marginTop: 5, padding: 10 },
    returnLinkText: { color: colors.blue, fontSize: 15, fontWeight: '600' },
});
