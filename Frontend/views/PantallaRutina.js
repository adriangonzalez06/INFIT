import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PantallaRutina({ route }) {
  const navigation = useNavigation();
  const { rutina } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{rutina.nombre}</Text>

        <Text style={styles.sectionTitle}>📋 Descripción</Text>
        <Text style={styles.text}>
          Aquí puedes añadir ejercicios, tiempos, repeticiones, notas y más detalles para esta rutina.
        </Text>

        <Text style={styles.sectionTitle}>💪 Ejercicios sugeridos</Text>
        <Text style={styles.text}>
          - Sentadillas con peso
          - Prensa de piernas
          - Zancadas caminando
          - Elevaciones de talones
          - Estiramientos de cuádriceps
        </Text>

        <Text style={styles.sectionTitle}>🕒 Duración recomendada</Text>
        <Text style={styles.text}>
          Entre 45 y 60 minutos, dependiendo del número de series y descansos entre ejercicios.
        </Text>

        <Text style={styles.sectionTitle}>📝 Notas</Text>
        <Text style={styles.text}>
          Recuerda calentar antes de comenzar y estirar al finalizar. Mantén una buena hidratación y escucha a tu cuerpo.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 25,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
});
