import React, { useState } from "react";
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
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Challenges from "./views/Challenges";
import WelcomeScreen from "./views/WelcomeScreen";
import ProfileScreen from "./views/profile";
import SettingsScreen from "./views/settings";
import MainTabs from "./views/MainTabs";
import ForgotPassword from "./views/forgot_password";
import VerificationScreen from "./views/verificacion";
import RegisterScreen from "./views/RegisterScreen";
import EditProfile from "./views/EditProfile";
import AlimentacionScreen from "./views/Alimentacion";
import RutinasScreen from "./views/Rutinas";
import PantallaRutina from "./views/PantallaRutina";
import RuedaSettings from "./views/RuedaSettings";
import ChangingPassword from "./views/changing_password";
import ListaGrupoRecetas from "./views/ListaGrupoRecetas";
import RecipeView from "./views/RecipeView";
import colors from "./views/colors";

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import {
  getAuth,
  signInWithEmailAndPassword,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

// Inicialización segura de Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;
      const uid = user.uid;

      console.log("✅ Logged in! UID:", uid);

      // Guardar datos en AsyncStorage
      await ReactNativeAsyncStorage.setItem("userUID", uid);
      await ReactNativeAsyncStorage.setItem("userEmail", email.trim());

      // Obtener el nombre del usuario desde el backend
      try {
        const axios = require("axios");
        const backendUrl = `http://10.0.2.2:8082/api/usuarios/${uid}`;
        const response = await axios.get(backendUrl);
        const userName = response.data.nombre || "Usuario";

        // Guardar el nombre en AsyncStorage
        await ReactNativeAsyncStorage.setItem("userName", userName);
        console.log("✅ Nombre guardado:", userName);
      } catch (err) {
        console.warn(
          "⚠️ No se pudo obtener el nombre del backend:",
          err.message
        );
        // Si falla, usa un nombre por defecto
        await ReactNativeAsyncStorage.setItem("userName", "Usuario");
      }

      navigation.navigate("MainTabs");
    } catch (error) {
      console.error("❌ Error en login:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          style={styles.logo}
          source={require("./assets/logos/logo_white_bg.svg")}
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

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.link}>¿Has olvidado tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.botonTexto}>Siguiente</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
            <Text style={styles.link}>
              ¿No tienes cuenta todavía? Regístrate
            </Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>─── O inicia sesión con ───</Text>

          <TouchableOpacity style={styles.google}>
            <Image
              source={require("./assets/logos/google.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Boton para ir al menu sin iniciar sesion para no perder tanto tiempo */}
        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.botonTexto}>Debug ir al menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Registro"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Verificacion"
            component={VerificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={({ navigation }) => ({
              headerShown: false,
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Ajustes")}
                  style={{ marginRight: 15 }}
                >
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
                <TouchableOpacity
                  onPress={() => navigation.navigate("Ajustes")}
                  style={{ marginRight: 15 }}
                >
                  <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Rutinas"
            component={RutinasScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PantallaRutina"
            component={PantallaRutina}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Alimentacion"
            component={AlimentacionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RuedaSettings"
            component={RuedaSettings}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Ajustes"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChangingPassword"
            component={ChangingPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ListaGrupoRecetas"
            component={ListaGrupoRecetas}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Recipe"
            component={RecipeView}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Challenges"
            component={Challenges}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_gray,
  },
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
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
    alignSelf: "center",
  },
  boton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    color: "#007AFF",
    textAlign: "center",
  },
  dividerText: {
    marginTop: 30,
    marginBottom: 40,
    textAlign: "center",
    color: colors.dark_gray,
  },

  google: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: "center",
    marginTop: -20,
  },
});
