import { SafeAreaView, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import styles from './stylesheet';
import colors from './colors';


function ChangingPassword({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);

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
  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: '#121212' }]}>
      <Text style={[styles.changingPassSubtitle, darkMode && { color: '#fff' }]}>Hemos enviado un mensaje a su correo electrónico con un enlace para cambiar su contraseña.
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
