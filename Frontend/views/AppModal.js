/**
 * AppModal — Modal de alerta personalizado para INFIT
 *
 * Props:
 *   visible     {boolean}   — muestra/oculta el modal
 *   type        {string}    — 'success' | 'error' | 'warning' | 'info' | 'confirm'
 *   title       {string}    — título
 *   message     {string}    — cuerpo del mensaje
 *   highlight   {string}    — texto resaltado en rojo (ej. email, nombre del ítem)
 *   confirmText {string}    — texto del botón principal (default: 'Aceptar')
 *   cancelText  {string}    — texto del botón secundario (solo en confirm)
 *   onConfirm   {function}  — callback al pulsar el botón principal
 *   onCancel    {function}  — callback al pulsar cancelar / cerrar (solo confirm)
 *   darkMode    {boolean}   — activa estilos dark
 */
import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from './colors';

const CONFIG = {
    success: {
        icon: 'checkmark-circle-outline',
        bgColor: colors.primary,
        accentColor: colors.primary,
    },
    error: {
        icon: 'close-circle-outline',
        bgColor: '#d32f2f',
        accentColor: '#d32f2f',
    },
    warning: {
        icon: 'warning-outline',
        bgColor: '#E65100',
        accentColor: '#E65100',
    },
    info: {
        icon: 'information-circle-outline',
        bgColor: '#1565C0',
        accentColor: '#1565C0',
    },
    confirm: {
        icon: 'help-circle-outline',
        bgColor: colors.primary,
        accentColor: colors.primary,
    },
};

export default function AppModal({
    visible = false,
    type = 'info',
    title = '',
    message = '',
    highlight = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    darkMode = false,
}) {
    const cfg = CONFIG[type] || CONFIG.info;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel || onConfirm}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, darkMode && styles.darkCard]}>

                    {/* Círculo de icono */}
                    <View style={[styles.iconCircle, { backgroundColor: cfg.bgColor }]}>
                        <Ionicons name={cfg.icon} size={46} color="#fff" />
                    </View>

                    {/* Título */}
                    <Text style={[styles.title, darkMode && styles.darkTitle]}>{title}</Text>

                    {/* Mensaje */}
                    {!!message && (
                        <Text style={[styles.message, darkMode && styles.darkMessage]}>{message}</Text>
                    )}

                    {/* Texto resaltado (email, nombre, etc.) */}
                    {!!highlight && (
                        <Text style={[styles.highlight, { color: cfg.accentColor }]}>{highlight}</Text>
                    )}

                    {/* Separador */}
                    <View style={[styles.divider, darkMode && styles.darkDivider]} />

                    {/* Botones */}
                    {type === 'confirm' ? (
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.btnSecondary, darkMode && styles.darkBtnSecondary]}
                                onPress={onCancel}
                            >
                                <Text style={[styles.btnSecondaryText, darkMode && styles.darkBtnSecondaryText]}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnPrimary, { backgroundColor: cfg.bgColor }]}
                                onPress={onConfirm}
                            >
                                <Text style={styles.btnPrimaryText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.btnFull, { backgroundColor: cfg.bgColor }]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.btnPrimaryText}>{confirmText}</Text>
                        </TouchableOpacity>
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    darkCard: {
        backgroundColor: '#1e1e1e',
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    title: {
        fontSize: 21,
        fontWeight: '800',
        color: '#111',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    darkTitle: {
        color: '#fff',
    },
    message: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 6,
    },
    darkMessage: {
        color: '#aaa',
    },
    highlight: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 4,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 18,
    },
    darkDivider: {
        backgroundColor: '#333',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    btnFull: {
        width: '100%',
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnPrimary: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.2,
    },
    btnSecondary: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    darkBtnSecondary: {
        backgroundColor: '#2a2a2a',
    },
    btnSecondaryText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    darkBtnSecondaryText: {
        color: '#aaa',
    },
});
