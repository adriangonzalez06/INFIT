
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TextInput,
  PanResponder
} from "react-native";
import colors from './colors.js';

const { height } = Dimensions.get("window");

const BuscarScreen = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [tipoMenu, setTipoMenu] = useState(null);
  const [searchText, setSearchText] = useState("");
  const slideAnim = useRef(new Animated.Value(height)).current;

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
    setSearchText("");
    Animated.timing(slideAnim, {
      toValue: height * 0.2, // posición inicial del bottom sheet
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(height * 0.2 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          cerrarMenu();
        } else {
          Animated.timing(slideAnim, {
            toValue: height * 0.2,
            duration: 200,
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  const data = tipoMenu === "ejercicios" ? ejercicios : alimentos;
  const filteredData = data.filter(item =>
    item.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      {/* Imagen arriba */}
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>📷</Text>
      </View>

      {/* Info abajo */}
      <View style={styles.infoContainer}>
        <Text style={styles.publisher}>Publicado por: Juan Pérez</Text>
        <Text style={styles.routineName}>{item.nombre}</Text>
        <Text style={styles.description}>
          {tipoMenu === "ejercicios"
            ? `Rutina para quemar ${item.calorias} kcal en ${item.tiempo} min`
            : `Plato con ${item.calorias} kcal por 100g`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Explora y Añade</Text>
        <Text style={styles.subHeader}>Selecciona una opción para buscar</Text>

        <TouchableOpacity style={styles.mainButton} onPress={() => abrirMenu("ejercicios")}>
          <Text style={styles.buttonText}> Buscar Ejercicios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainButton} onPress={() => abrirMenu("alimentos")}>
          <Text style={styles.buttonText}> Buscar Alimentos</Text>
        </TouchableOpacity>
      </View>

      {mostrarMenu && (
        <Animated.View
          style={[styles.bottomSheet, { top: slideAnim }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <Text style={styles.sheetTitle}>
            {tipoMenu === "ejercicios" ? "Ejercicios Disponibles" : "Alimentos Disponibles"}
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchText}
            onChangeText={setSearchText}
          />

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg_gray, marginTop: '7%' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  header: { fontSize: 28, fontWeight: "bold", color: "#333" },
  subHeader: { fontSize: 16, color: "#666", marginBottom: 20 },
  mainButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.8, // más grande
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10
  },
  sheetTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16
  },
  cardContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 4
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center"
  },
  imagePlaceholder: {
    fontSize: 40,
    color: "#999"
  },
  infoContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    justifyContent: "center"
  },
  publisher: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4
  },
  routineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: "#555"
  }
});

export default BuscarScreen;