import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function VerificationScreen({ route, navigation }) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [darkMode, setDarkMode] = useState(false);
  const inputs = useRef([]);

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

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Mover al siguiente input
      if (index < 4) {
        inputs.current[index + 1].focus();
      }
    } else if (text === '') {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 5) {
      Alert.alert('Código incompleto', 'Introduce los 5 dígitos correctamente.');
      return;
    }

    // Simulación de verificación
    Alert.alert('Verificado', `Código ingresado: ${fullCode}`);
    navigation.navigate('Perfil');
  };

  const handleResend = () => {
    Alert.alert('Correo reenviado', 'Te hemos enviado un nuevo código.');
  };

  const email = route?.params?.email || 'ex****@g********';

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.darkText]}>Verificación</Text>
      </View>
      <Text style={[styles.subtitle, darkMode && styles.darkTextSecondary]}>
        Introduce el número de 5 dígitos que se ha enviado al correo {email}
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[styles.codeInput, darkMode && styles.darkCodeInput]}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verificar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend}>
        <Text style={[styles.resendText, darkMode && { color: '#64b5f6' }]}>¿No has recibido el correo? Reenviar correo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddbd1',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  darkContainer: {
    backgroundColor: '#121212',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111114',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#30383a',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 20,
    color: '#111114',
  },
  darkCodeInput: {
    backgroundColor: '#1e1e1e',
    borderColor: '#444',
    color: '#fff',
  },
  button: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 14,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
