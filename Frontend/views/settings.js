import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, signOut } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import AppModal from './AppModal';

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState("kg/cm");
  const [language, setLanguage] = useState("es");
  const [modal, setModal] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });

  const showModal = (type, title, message, onConfirm = null) =>
    setModal({ visible: true, type, title, message, onConfirm });
  const hideModal = () => setModal(m => ({ ...m, visible: false }));

  // Cargar preferencia al montar el componente
  React.useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await ReactNativeAsyncStorage.getItem("darkMode");
      if (savedTheme !== null) {
        setDarkMode(savedTheme === "true");
      }
    };
    loadTheme();
  }, []);

  // Función para cambiar y guardar el tema
  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    await ReactNativeAsyncStorage.setItem("darkMode", String(value));
  };

  const confirmAction = (message, action, title = 'Confirmación') => {
    showModal('confirm', title, message, action);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await ReactNativeAsyncStorage.removeItem("userUID");
      await ReactNativeAsyncStorage.removeItem("userName");
      await ReactNativeAsyncStorage.removeItem("userEmail");
      await ReactNativeAsyncStorage.removeItem("idToken");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showModal('error', 'Error al cerrar sesión', error.message || 'No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
  };

  // Color dinámico para iconos y textos secundarios
  const iconColor = darkMode ? "#bbb" : "#333";
  const textColor = darkMode ? "#fff" : "#333";
  const sectionHeaderColor = darkMode ? "#ef2b2d" : "#555";


  return (
    <>
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <ScrollView>
          {/* Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
            </TouchableOpacity>
            <Text style={[styles.title, darkMode && styles.darkText]}>Ajustes</Text>
          </View>

          {/* Sección Cuenta */}
          <Text style={[styles.section, { color: sectionHeaderColor }]}>Cuenta</Text>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="key-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Cambiar contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={darkMode ? "#444" : "#ccc"} />
          </Pressable>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="person-circle-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Editar perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={darkMode ? "#444" : "#ccc"} />
          </Pressable>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => navigation.navigate("ChangeEmail")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="mail-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Cambiar correo electrónico</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={darkMode ? "#444" : "#ccc"} />
          </Pressable>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => confirmAction("¿Deseas cerrar sesión?", handleLogout)}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="log-out-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Cerrar sesión</Text>
            </View>
          </Pressable>

          {/* Sección Preferencias */}
          <Text style={[styles.section, { color: sectionHeaderColor }]}>Preferencias</Text>

          <View style={[styles.option, darkMode && styles.darkOption]}>
            <View style={styles.optionLeft}>
              <Ionicons name="moon-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Modo oscuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#ddd", true: "#ef2b2d" }}
              thumbColor={Platform.OS === "ios" ? undefined : (darkMode ? "#fff" : "#f4f3f4")}
            />
          </View>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => setUnits(units === "kg/cm" ? "lb/in" : "kg/cm")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="scale-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Unidades: {units}</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => setLanguage(language === "es" ? "en" : "es")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="language-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Idioma: {language}</Text>
            </View>
          </Pressable>

          {/* Sección Sistema */}
          <Text style={[styles.section, { color: sectionHeaderColor }]}>Sistema</Text>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => confirmAction("¿Deseas borrar la caché?", () => { })}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="trash-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Borrar caché</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => confirmAction("¿Deseas borrar todos los datos?", () => { })}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="warning-outline" size={20} color="#ef2b2d" />
              <Text style={[styles.optionText, { color: "#ef2b2d" }]}>Borrar todos los datos</Text>
            </View>
          </Pressable>

          {/* Sección Legal */}
          <Text style={[styles.section, { color: sectionHeaderColor }]}>Legal</Text>
          <Pressable
            style={[styles.option, darkMode && styles.darkOption]}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="document-text-outline" size={20} color={iconColor} />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>Política de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={darkMode ? "#444" : "#ccc"} />
          </Pressable>

          <Text style={styles.version}>Versión 1.0.0</Text>
        </ScrollView>
      </View>
      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.type === 'confirm' ? 'Aceptar' : 'Entendido'}
        cancelText="Cancelar"
        onConfirm={() => { hideModal(); modal.onConfirm && modal.onConfirm(); }}
        onCancel={hideModal}
        darkMode={darkMode}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
  },
  darkText: {
    color: "#ffffff",
  },
  section: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 25,
    marginBottom: 10,
    letterSpacing: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    justifyContent: "space-between",
  },
  darkOption: {
    borderBottomColor: "#222",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  version: {
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    fontSize: 14,
    color: "#999",
  },
});

