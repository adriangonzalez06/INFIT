import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { initializeAuth, getReactNativePersistence, sendPasswordResetEmail} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

  const handlePasswordReset = () => {
    if (!email.trim()) {
      Alert.alert('Ups...', 'Por favor, introduce tu correo electrónico.');
      return;
    }

    try {
        sendPasswordResetEmail(auth, email);
      } catch (error) {
        Alert.alert('Error', error.message);
      }

    Alert.alert(
      '¡Listo!',
      `Te hemos enviado un enlace a:\n${email}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ChangingPassword', { email }),
        },
      ]
    );
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
        Introduce tu correo electrónico para recibir un enlace de recuperación.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Enviar enlace</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddbd1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111114',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#30383a',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
