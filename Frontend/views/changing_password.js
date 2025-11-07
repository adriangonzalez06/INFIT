// views/WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function ChangingPassword({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.subtitle}>Hemos enviado un mensaje a su correo electrónico con un enlace para cambiar su contraseña. 
        Cuando la cambie, pulse el siguiente botón.</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.botonTexto}>He cambiado mi contraseña</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


export default ChangingPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddbd1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});