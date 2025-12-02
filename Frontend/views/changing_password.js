// views/WelcomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './stylesheet';

function ChangingPassword({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.changingPassSubtitle}>Hemos enviado un mensaje a su correo electrónico con un enlace para cambiar su contraseña. 
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
