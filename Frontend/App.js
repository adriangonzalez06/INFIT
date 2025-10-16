import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from './views/WelcomeScreen';
import ProfileScreen from './views/profile';
import SettingsScreen from './views/settings';
import MainTabs from './views/MainTabs';
import ForgotPassword from './views/forgot_password';
import VerificationScreen from './views/verificacion';
import RegisterScreen from './views/RegisterScreen';
import AlimentacionScreen from './views/Alimentacion';
import RutinasScreen from './views/Rutinas';
import PantallaRutina from './views/PantallaRutina';
import RuedaSettings from './views/RuedaSettings';
import ChangingPassword from './views/changing_password';

import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import {
  getAuth,
  signInWithEmailAndPassword,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

// Inicialización segura de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    signInWithEmailAndPassword(auth, email.trim(), password)
      .then((userCredential) => {
        console.log('Logged in!');
        const user = userCredential.user;
        console.log(user);
        navigation.navigate('MainTabs');
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Error', error.message);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          style={styles.logo}
          source={require('./assets/logos/logo_white_bg.svg')} // Asegúrate que sea PNG o JPG
        />
        <SafeAreaView>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>¿Has olvidado tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.botonTexto}>Siguiente</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.link}>¿No tienes cuenta todavía? Regístrate</Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>─── O inicia sesión con ───</Text>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Registro" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="Verificacion" component={VerificationScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={({ navigation }) => ({
              headerShown: true,
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Ajustes')} style={{ marginRight: 15 }}>
                  <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Perfil"
            component={ProfileScreen}
            options={({ navigation }) => ({
              headerShown: true,
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Ajustes')} style={{ marginRight: 15 }}>
                  <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="Rutinas" component={RutinasScreen} />
          <Stack.Screen name="PantallaRutina" component={PantallaRutina} />
          <Stack.Screen name="Alimentacion" component={AlimentacionScreen} />
          <Stack.Screen name="RuedaSettings" component={RuedaSettings} />
          <Stack.Screen name="Ajustes" component={SettingsScreen} />
          <Stack.Screen name="ChangingPassword" component={ChangingPassword} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dddbd1',
  },
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  input: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: '#111114',
    backgroundColor: '#fff',
    width: 250,
    alignSelf: 'center',
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  dividerText: {
    marginTop: 30,
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
});