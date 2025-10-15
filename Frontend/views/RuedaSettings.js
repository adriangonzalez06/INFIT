// views/RuedaSettings.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

const RuedaSettings = () => {
  const navigation = useNavigation();

  const cerrarSesion = async () => {
    try {
      await signOut(getAuth());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajustes de perfil</Text>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Perfil')}>
        <Text style={styles.optionText}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('MainTabs')}>
        <Text style={styles.optionText}>Volver al inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={cerrarSesion}>
        <Text style={styles.optionText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default RuedaSettings;
