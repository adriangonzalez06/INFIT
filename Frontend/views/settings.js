import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState('kg/cm');
  const [language, setLanguage] = useState('es');

  const confirmAction = (message, action) => {
    Alert.alert('Confirmación', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aceptar', onPress: action },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <ScrollView>
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
          </TouchableOpacity>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        {/* Sección Cuenta */}
        <Text style={styles.section}>Cuenta</Text>
        <Pressable style={styles.option} onPress={() => navigation.navigate('ChangePassword')}>
          <Ionicons name="key-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Cambiar contraseña</Text>
        </Pressable>
        <Pressable style={styles.option} onPress={() => navigation.navigate('ChangeEmail')}>
          <Ionicons name="mail-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Cambiar correo electrónico</Text>
        </Pressable>
        <Pressable style={styles.option} onPress={() => confirmAction('¿Deseas cerrar sesión?', () => {/* cerrar sesión */})}>
          <Ionicons name="log-out-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Cerrar sesión</Text>
        </Pressable>

        {/* Sección Preferencias */}
        <Text style={styles.section}>Preferencias</Text>
        <View style={styles.option}>
          <Ionicons name="moon-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Modo oscuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <Pressable style={styles.option} onPress={() => setUnits(units === 'kg/cm' ? 'lb/in' : 'kg/cm')}>
          <Ionicons name="scale-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Unidades: {units}</Text>
        </Pressable>
        <Pressable style={styles.option} onPress={() => setLanguage(language === 'es' ? 'en' : 'es')}>
          <Ionicons name="language-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Idioma: {language}</Text>
        </Pressable>

        {/* Sección Sistema */}
        <Text style={styles.section}>Sistema</Text>
        <Pressable style={styles.option} onPress={() => confirmAction('¿Deseas borrar la caché?', () => {/* aqui hay que hacer el codigo borrar caché */})}>
          <Ionicons name="trash-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Borrar caché</Text>
        </Pressable>
        <Pressable style={styles.option} onPress={() => confirmAction('¿Deseas borrar todos los datos?', () => {/* hay qye hacer el codigo para eliminar la cuenta*/})}>
          <Ionicons name="warning-outline" size={20} color="#ef2b2d" />
          <Text style={styles.optionText}>Borrar todos los datos</Text>
        </Pressable>

        {/* Sección Legal */}
        <Text style={styles.section}>Legal</Text>
        <Pressable style={styles.option} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Ionicons name="document-text-outline" size={20} color="#333" />
          <Text style={styles.optionText}>Política de privacidad</Text>
        </Pressable>

        {/* Información de la app */}
        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  darkContainer: {
    backgroundColor: '#222',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    justifyContent: 'space-between',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  version: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
    color: '#999',
  },
});