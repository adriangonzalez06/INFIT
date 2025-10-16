import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function VerificationScreen({ route, navigation }) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputs = useRef([]);

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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      <Text style={styles.title}>Verificación</Text>
      <Text style={styles.subtitle}>
        Introduce el número de 5 dígitos que se ha enviado al correo {email}
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.codeInput}
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
        <Text style={styles.resendText}>¿No has recibido el correo? Reenviar correo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddbd1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
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
