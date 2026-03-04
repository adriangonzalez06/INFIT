import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import {
  getAuth,
  signInWithEmailAndPassword,
  getReactNativePersistence,
  updateProfile,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // { changed code }

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Challenges from './views/Challenges';
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
import ListaGrupoRecetas from './views/ListaGrupoRecetas';
import AddDietMenu from './views/AddDietMenu';
import colors from './views/colors';
import CreateDishMenu from "./views/CreateDishMenu";
import ChangeEmailScreen from './views/change_email';
import AppModal from './views/AppModal';

import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { BACKEND_URL } from './src/config';

const Stack = createNativeStackNavigator();

// Inicialización segura de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [modal, setModal] = useState({ visible: false, type: 'error', title: '', message: '' });
  const showModal = (type, title, message) => setModal({ visible: true, type, title, message });
  const hideModal = () => setModal(m => ({ ...m, visible: false }));

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("darkMode");
      setDarkMode(savedTheme === "true");
    };
    loadTheme();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('warning', 'Campos incompletos', 'Por favor, introduce tu correo y contraseña.');
      return;
    }
    try {
      // Autenticar en Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;



      // { changed code }} Declarar variables antes del try
      let userId = null;
      let streak = null;
      let nombreBackend = null;

      try {
        const resp = await axios.get(
          `${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(user.email.trim())}`,
          { timeout: 5000 }
        );
        userId = resp.data?.id;
        streak = resp.data?.streak;
        nombreBackend = resp.data?.nombre;

        if (!userId) {
          showModal('error', 'Usuario no encontrado', 'No se encontró el usuario en la base de datos. Contacta con soporte.');
          return;
        }

        // Guardar userId y streak en AsyncStorage
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('streak', (streak || 0).toString());
        console.log('userId guardado en AsyncStorage:', userId);
        console.log('streak guardado en AsyncStorage:', streak || 0);

      } catch (e) {
        console.error('Error obteniendo usuario del backend:', e?.message || e);
        showModal('error', 'Error de conexión', 'No se pudo obtener los datos del usuario. Verifica tu conexión e inténtalo de nuevo.');
        return;
      }

      // Actualizar displayName si viene del backend
      if (nombreBackend && (!user.displayName || user.displayName !== nombreBackend)) {
        try {
          await updateProfile(user, { displayName: nombreBackend });
          console.log('displayName actualizado desde backend:', nombreBackend);
        } catch (e) {
          console.warn('No se pudo actualizar displayName:', e?.message || e);
        }
      }

      // { changed code }} Solo navega si userId fue obtenido correctamente
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Error en login:', error);
      let msg = error.message || 'Error al iniciar sesión';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg = 'Contraseña incorrecta. Vuelve a intentarlo.';
      else if (error.code === 'auth/user-not-found') msg = 'No existe ninguna cuenta con este correo.';
      else if (error.code === 'auth/too-many-requests') msg = 'Demasiados intentos. Espera unos minutos.';
      else if (error.code === 'auth/network-request-failed') msg = 'Sin conexión a Internet. Verifica tu red.';
      showModal('error', 'No se pudo iniciar sesión', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, darkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar hidden={true} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          style={styles.logo}
          source={darkMode ? require('./assets/logos/logo_red_bg.svg') : require('./assets/logos/logo_white_bg.svg')}
        />
        <SafeAreaView>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Correo electrónico"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Contraseña"
            placeholderTextColor={darkMode ? "#666" : "#999"}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.link, darkMode && { color: '#64b5f6' }]}>¿Has olvidado tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.botonTexto}>Siguiente</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={[styles.link, darkMode && { color: '#64b5f6' }]}>¿No tienes cuenta todavía? Regístrate</Text>
          </TouchableOpacity>

          <Text style={[styles.dividerText, darkMode && { color: '#aaa' }]}>─── O inicia sesión con ───</Text>


          <TouchableOpacity style={[styles.google, darkMode && styles.darkGoogle]}>
            <Image
              source={require('./assets/logos/google.png')}
              style={{ width: 60, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>




        </SafeAreaView>


      </ScrollView>
      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText="Entendido"
        onConfirm={hideModal}
        darkMode={darkMode}
      />
    </KeyboardAvoidingView>
  );
}

export default function App() {
  const transparentTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={transparentTheme}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Registro" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="Verificacion" component={VerificationScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={({ navigation }) => ({
              headerShown: false,
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
              headerShown: false,
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Ajustes')} style={{ marginRight: 15 }}>
                  <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="PantallaRutina" component={PantallaRutina} options={{ headerShown: false }} />
          <Stack.Screen name="Alimentacion" component={AlimentacionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RuedaSettings" component={RuedaSettings} options={{ headerShown: false }} />
          <Stack.Screen name="Ajustes" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChangingPassword" component={ChangingPassword} options={{ headerShown: false }} />
          <Stack.Screen name="ListaGrupoRecetas" component={ListaGrupoRecetas} options={{ headerShown: false }} />
          <Stack.Screen name="Challenges" component={Challenges} options={{ headerShown: false }} />
          <Stack.Screen name="AddDietMenu" component={AddDietMenu} options={{ headerShown: false }} />
          <Stack.Screen name="CreateDishMenu" component={CreateDishMenu} options={{ headerShown: false }} />
          <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: colors.bg_dark,
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
    borderColor: colors.gray,
    borderRadius: 10,
    color: colors.dark_gray,
    backgroundColor: colors.white,
    width: 250,
    alignSelf: 'center',
  },
  darkInput: {
    backgroundColor: '#1e1e1e',
    borderColor: '#444',
    color: '#fff',
  },
  boton: {
    backgroundColor: colors.primary,
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
    color: colors.blue,
    textAlign: 'center',
  },
  dividerText: {
    marginTop: 30,
    marginBottom: 40,
    textAlign: 'center',
    color: colors.dark_gray,
  },

  google: {
    width: 280,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: 'center',
    marginTop: -20,

  },

  google2: {
    width: 280,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: 'center',
    marginTop: 10,


  },

  google3: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: 'center',
    marginTop: 10,

  },

  googletext: {
    fontSize: 16,
    color: colors.dark_gray,
    alignSelf: 'center',

  },

});