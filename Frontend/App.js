// App.js
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './views/MainTabs';
import ForgotPassword from './views/forgot_password';
import VerificationScreen from './views/verificacion';
import RegisterScreen from './views/RegisterScreen';
import ProfileScreen from './views/profile';
import AlimentacionScreen from './views/Alimentacion';
import RutinasScreen from './views/Rutinas';
import PantallaRutina from './views/PantallaRutina';

import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import {
  getAuth,
  createUserWithEmailAndPassword,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const auth = useMemo(() =>
    getAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    }), [app]);

  const handleCreateAccount = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created!', userCredential.user);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error(error);
    }
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
          source={require('./assets/logos/logo_white_bg.png')} // ✅ Usa PNG o JPG
        />
        <SafeAreaView>
          <TextInput
            style={styles.input}
            placeholder="Usuario o e-mail"
            value={email}
            onChangeText={setEmail}
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

          <TouchableOpacity style={styles.boton} onPress={handleCreateAccount}>
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
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="Verificacion" component={VerificationScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Perfil" component={ProfileScreen} />
          <Stack.Screen name="Alimentacion" component={AlimentacionScreen} />
          <Stack.Screen name="Rutinas" component={RutinasScreen} />
          <Stack.Screen name="PantallaRutina" component={PantallaRutina} />
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
