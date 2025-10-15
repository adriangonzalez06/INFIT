// views/RuedaSettings.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const RuedaSettings = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

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

  const ajustes = [
    {
      label: 'Editar perfil',
      icon: 'person-outline',
      action: () => navigation.navigate('Perfil'),
    },
    {
      label: 'Volver al inicio',
      icon: 'home-outline',
      action: () => navigation.navigate('MainTabs'),
    },
    {
      label: 'Cerrar sesión',
      icon: 'log-out-outline',
      action: cerrarSesion,
    },
  ];

  // Simulación de estadísticas (puedes conectarlo a Firestore más adelante)
  const estadisticas = [
    { label: 'Actividades', value: 42 },
    { label: 'Distancia total', value: '128 km' },
    { label: 'Calorías quemadas', value: '9.450 kcal' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabecera tipo Strava */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.photoURL || 'https://ui-avatars.com/api/?name=User' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Estadísticas tipo Strava */}
      <View style={styles.statsContainer}>
        {estadisticas.map((item, index) => (
          <View key={index} style={styles.statBox}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Opciones de ajustes */}
      <Text style={styles.sectionTitle}>Tu cuenta</Text>
      <View style={styles.card}>
        {ajustes.map((item, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
            <View style={styles.optionContent}>
              <Ionicons name={item.icon} size={22} color="#FF5A5F" style={styles.icon} />
              <Text style={styles.optionText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 5,
    elevation: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default RuedaSettings;
