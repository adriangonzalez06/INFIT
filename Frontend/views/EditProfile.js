import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfile({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [goal, setGoal] = useState("");
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const n = await ReactNativeAsyncStorage.getItem("userName");
        const e = await ReactNativeAsyncStorage.getItem("userEmail");
        const p = await ReactNativeAsyncStorage.getItem("userWeight");
        const a = await ReactNativeAsyncStorage.getItem("userHeight");
        const b = await ReactNativeAsyncStorage.getItem("userBirthdate");
        const g = await ReactNativeAsyncStorage.getItem("userGoal");
        const docId = await ReactNativeAsyncStorage.getItem("userDocId");

        if (n) setNombre(n);
        if (e) setEmail(e);
        if (p) setPeso(p);
        if (a) setAltura(a);
        if (b) setBirthdate(b);
        if (g) setGoal(g);
        if (docId) setUserId(docId);
      } catch (err) {
        console.error("Load profile error", err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!nombre || !email) {
      Alert.alert("Error", "Nombre y correo son obligatorios");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "No se pudo obtener tu ID de usuario");
      return;
    }

    setIsSaving(true);
    try {
      // Preparar datos para actualizar en el backend
      const updateData = {
        nombre,
        email,
      };

      // Agregar peso y altura si están disponibles
      if (peso) updateData.weight = parseFloat(peso);
      if (altura) updateData.height = parseFloat(altura);
      if (birthdate) updateData.birthdate = birthdate;
      if (goal) updateData.goal = goal;

      // Actualizar en el backend
      const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      const url = `http://${host}:8082/api/usuarios/${userId}`;

      console.log('Enviando petición a:', url);
      console.log('Datos:', updateData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del backend:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // Guardar en AsyncStorage
      await ReactNativeAsyncStorage.setItem("userName", nombre);
      await ReactNativeAsyncStorage.setItem("userEmail", email);
      if (peso) await ReactNativeAsyncStorage.setItem("userWeight", peso);
      if (altura) await ReactNativeAsyncStorage.setItem("userHeight", altura);
      if (birthdate)
        await ReactNativeAsyncStorage.setItem("userBirthdate", birthdate);
      if (goal) await ReactNativeAsyncStorage.setItem("userGoal", goal);

      Alert.alert("Guardado", "Perfil actualizado correctamente");
      navigation.goBack();
    } catch (err) {
      console.error("Save profile error", err);
      Alert.alert("Error", `No se pudo guardar el perfil: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Editar perfil</Text>
         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
              </TouchableOpacity>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Altura (m)</Text>
        <TextInput
          style={styles.input}
          value={altura}
          onChangeText={setAltura}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Fecha de nacimiento (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={birthdate}
          onChangeText={setBirthdate}
        />

        <Text style={styles.label}>Objetivo</Text>
        <TextInput style={styles.input} value={goal} onChangeText={setGoal} />

        <TouchableOpacity
          style={[styles.button, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 14, color: "#444", marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#ef2b2d",
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },


});