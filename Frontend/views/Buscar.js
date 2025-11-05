import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions
} from "react-native";

const { height } = Dimensions.get("window");

const BuscarScreen = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [tipoMenu, setTipoMenu] = useState(null);
  const slideAnim = useState(new Animated.Value(height))[0];

  const ejercicios = [
    { id: "1", nombre: "Correr", calorias: 300, tiempo: 30 },
    { id: "2", nombre: "Bicicleta", calorias: 250, tiempo: 30 },
    { id: "3", nombre: "Flexiones", calorias: 130, tiempo: 15 },
    { id: "4", nombre: "Sentadillas", calorias: 150, tiempo: 20 },
    { id: "5", nombre: "Burpees", calorias: 200, tiempo: 15 }
  ];

  const alimentos = [
    { id: "1", nombre: "Manzana", calorias: 52, cantidad: 100 },
    { id: "2", nombre: "Pollo", calorias: 239, cantidad: 100 },
    { id: "3", nombre: "Arroz", calorias: 130, cantidad: 100 },
    { id: "4", nombre: "Avena", calorias: 389, cantidad: 100 },
    { id: "5", nombre: "Huevo", calorias: 155, cantidad: 100 }
  ];

  const abrirMenu = (tipo) => {
    setTipoMenu(tipo);
    setMostrarMenu(true);
    Animated.timing(slideAnim, {
      toValue: height * 0.3,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const cerrarMenu = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setMostrarMenu(false);
      setTipoMenu(null);
    });
  };

  const renderItem = (item, tipo) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardSubtitle}>
          {tipo === "ejercicio"
            ? `${item.calorias} kcal / ${item.tiempo} min`
            : `${item.calorias} kcal / 100g`}
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Explora y Añade</Text>
        <Text style={styles.subHeader}>Selecciona una opción para buscar</Text>

        {/* Botones principales */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => abrirMenu("ejercicios")}
        >
          <Text style={styles.buttonIcon}>🏋️</Text>
          <Text style={styles.buttonText}>Buscar Ejercicios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => abrirMenu("alimentos")}
        >
          <Text style={styles.buttonIcon}>🍎</Text>
          <Text style={styles.buttonText}>Buscar Alimentos</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.caloriesButton}>
            <Text style={styles.caloriesText}>🔥 Total: 320 kcal</Text>
            <Text style={styles.continueText}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      {mostrarMenu && (
        <Animated.View style={[styles.bottomSheet, { top: slideAnim }]}>
          <Text style={styles.sheetTitle}>
            {tipoMenu === "ejercicios" ? "Ejercicios Disponibles" : "Alimentos Disponibles"}
          </Text>
          <FlatList
            data={tipoMenu === "ejercicios" ? ejercicios : alimentos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderItem(item, tipoMenu)}
          />
          <TouchableOpacity style={styles.closeButton} onPress={cerrarMenu}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  header: { fontSize: 28, fontWeight: "bold", color: "#333" },
  subHeader: { fontSize: 16, color: "#666", marginBottom: 20 },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4
  },
  buttonIcon: { fontSize: 26, marginRight: 12 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16
  },
  caloriesButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4
  },
  caloriesText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  continueText: { color: "#fff", fontSize: 16 },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10
  },
  sheetTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardSubtitle: { fontSize: 14, color: "#666" },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  addButtonText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  closeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  },
  closeButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});

export default BuscarScreen;