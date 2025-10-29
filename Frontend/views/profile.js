import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const user = {
    nombre: 'Sergi Velasco',
    foto: require('../assets/avatar.png'),
    peso: 72,
    altura: 1.78,
    registros: [
      { tipo: 'Ejercicio', detalle: '30 min de cardio', fecha: '22/10/2025' },
      { tipo: 'Alimentación', detalle: 'Desayuno saludable', fecha: '22/10/2025' },
      { tipo: 'Sueño', detalle: 'Dormido 7h 45min', fecha: '21/10/2025' },
    ],
  };

  const imc = (user.peso / (user.altura * user.altura)).toFixed(1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabecera normal (no sticky) */}
      <View style={styles.headerContent}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Ajustes')}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={user.foto} style={styles.fotoPerfil} />
        <Text style={styles.nombre}>{user.nombre}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Stat label="Peso" value={`${user.peso} kg`} />
        <Stat label="Altura" value={`${user.altura} m`} />
        <Stat label="IMC" value={imc} />
      </View>

      <Text style={styles.sectionTitle}>Últimos registros</Text>
      {user.registros.map((registro, index) => (
        <View key={index} style={styles.registroBox}>
          <Text style={styles.registroTipo}>{registro.tipo}</Text>
          <Text style={styles.registroDetalle}>{registro.detalle}</Text>
          <Text style={styles.registroFecha}>{registro.fecha}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('RegistroNuevo')}
      >
        <Text style={styles.botonTexto}>Añadir nuevo registro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
    backgroundColor: '#f9f9f9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 30, // Espacio entre la rueda y la foto
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ef2b2d',
    marginBottom: 10,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
    paddingHorizontal: 20,
  },
  registroBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#ef2b2d',
  },
  registroTipo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  registroDetalle: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  registroFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});