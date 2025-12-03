
import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Searchbar } from "react-native-paper";

const BuscarScreen = () => {
  const [tipoMenu, setTipoMenu] = useState(null);
  const [searchText, setSearchText] = useState("");
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["50%", "90%"], []);

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
    setSearchText("");
    bottomSheetRef.current?.expand();
  };

  const cerrarMenu = () => {
    bottomSheetRef.current?.close();
    setTipoMenu(null);
    setSearchText("");
  };

  const data = tipoMenu === "ejercicios" ? ejercicios : alimentos;
  const filteredData = data.filter(item =>
    item.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardSubtitle}>
          {tipoMenu === "ejercicios"
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
    <View style={styles.container}>
      <Text style={styles.header}>Explora y Añade</Text>
      <Text style={styles.subHeader}>Selecciona una opción para buscar</Text>

      <TouchableOpacity style={styles.mainButton} onPress={() => abrirMenu("ejercicios")}>
        <Text style={styles.buttonText}>🏋️ Buscar Ejercicios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.mainButton} onPress={() => abrirMenu("alimentos")}>
        <Text style={styles.buttonText}>🍎 Buscar Alimentos</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.caloriesButton}>
          <Text style={styles.caloriesText}>🔥 Total: 320 kcal</Text>
          <Text style={styles.continueText}>Continuar →</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={cerrarMenu}
      >
        <View style={styles.sheetContent}>
          <Searchbar
            placeholder="Buscar..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchBar}
          />
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 8 },
  subHeader: { fontSize: 16, color: "#666", marginBottom: 20 },
  mainButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 20, left: 16, right: 16 },
  caloriesButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  caloriesText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  continueText: { color: "#fff", fontSize: 16 },
  sheetContent: { flex: 1, padding: 16 },
  searchBar: { marginBottom: 16 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12
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
  addButtonText: { color: "#fff", fontSize: 22, fontWeight: "bold" }
});

export default BuscarScreen;
