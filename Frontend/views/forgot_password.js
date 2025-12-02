import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { initializeAuth, getReactNativePersistence, sendPasswordResetEmail} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import styles from './stylesheet';


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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      <Text style={styles.changingPassTitle}>Recuperar contraseña</Text>
      <Text style={styles.changingPassSubtitle}>
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


