import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const userName = 'Sergi';

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>¡Hola, {userName}! </Text>
      <Text style={styles.motivation}>Hoy es un gran día para entrenar </Text>

      <Image
        source={require('../assets/logos/logo_white_bg.svg')}
        style={styles.logo}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChatBot')}
        >
          <Text style={styles.buttonText}>Ir al Chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Buscar')}
        >
          <Text style={styles.buttonText}>Buscar ejercicios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.profileButton]}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.buttonText}>Ver perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddbd1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 10,
    textAlign: 'center',
  },
  motivation: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
