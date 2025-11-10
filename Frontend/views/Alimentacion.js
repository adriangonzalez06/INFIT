import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Alimentacion() {
  const navigation = useNavigation();

  const [recetas] = useState({
    grupo1: [],
    grupo2: [],
    grupo3: [],
    grupo4: [],
    grupo5: [],
    grupo6: [],
  });

  const renderGrupo = (titulo, recetasGrupo, grupoKey) => (
    <View style={styles.grupoContainer}>
      {/* group title */}
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      {/* routines row */}
      <View style={styles.recetasRow}>
        {/* map displays a list of the items that are inside the function */}
        {recetasGrupo.map((receta) => (
          
          <TouchableOpacity
            key={receta.id}
            style={[styles.recetaCard, styles.shadow]}
            onPress={() => handleEntrarReceta(receta, grupoKey)}
          >
            <Text style={styles.recetaTexto}>{receta.nombre}</Text>
          </TouchableOpacity>
        ))}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          <TouchableOpacity style={styles.recetaCard} onPress={() => navigation.navigate("Receta")}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recetaCard} onPress={() => navigation.navigate("Receta")}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          style={styles.seeMoreCard}
          onPress={() => handleEntrarGrupoCompleto()}>
            <Ionicons name="arrow-back" size={24} color="#000000ff" />
            <Text style={{ color: '#000000ff', fontWeight: '600' }}>Ver más</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </View>
  );

    const renderGrupoAdd = (titulo, recetasGrupo, grupoKey) => (
    <View style={styles.grupoContainer}>
      {/* group title */}
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      {/* routines row */}
      <View style={styles.recetasRow}>
        {/* map displays a list of the items that are inside the function */}
        {recetasGrupo.map((receta) => (
          
          <TouchableOpacity
            key={receta.id}
            style={styles.recetaCard}
            onPress={() => handleEntrarReceta(receta, grupoKey)}
          >
            <Text style={styles.recetaTexto}>{receta.nombre}</Text>
          </TouchableOpacity>
        ))}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          <TouchableOpacity style={[styles.addCard, styles.shadow]}>
            <Ionicons name="add" size={32} color="#ef2b2d" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.recetaCard, styles.shadow]} onPress={() => navigation.navigate("Receta")}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
          </TouchableOpacity> 

          <TouchableOpacity style={[styles.recetaCard, styles.shadow]} onPress={() => navigation.navigate("Receta")}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
          </TouchableOpacity> 


          <TouchableOpacity style={styles.seeMoreCard}>
            <Ionicons name="arrow-back" size={32} color="#181818ff" />
            <Text style={{ color: '#000000ff', fontWeight: '600' }}>Ver más</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </View>
  );

  const handleEntrarReceta = (rutina, grupoKey) => {
    navigation.navigate('PantallaReceta', {
      rutina,
      grupoKey,
    });
  };

  const handleEntrarGrupoCompleto = () => {
    navigation.navigate('ListaGrupoRecetas');
  };

  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>Alimentación</Text>

      {/* render groups */}
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          {renderGrupo('Trending', recetas.grupo1, 'grupo1')}
          {renderGrupoAdd('Para ganar músculo', recetas.grupo2, 'grupo2')}
          {renderGrupoAdd('Mis dietas', recetas.grupo3, 'grupo3')}
          {renderGrupoAdd('Para mantener la figura', recetas.grupo4, 'grupo4')}
          {renderGrupoAdd('Para mantener la figura', recetas.grupo5, 'grupo5')}
          {renderGrupoAdd('Para mantener la figura', recetas.grupo6, 'grupo6')}
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grupoContainer: {
    marginBottom: 30,
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  recetasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recetaCard: {
    width: 140,
    height: 100,
    borderColor: '#5c5c5cff',
    borderRadius: 9,
    borderWidth: 1,
    padding: 10,
    marginRight: 12,
    backgroundColor: '#fff',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  shadow: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  recetaTexto: {
    fontSize: 14,
    color: '#111114',
    textAlign: 'center',
  },
  recetaTextoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111114',
    textAlign: 'center',
    margin: 10,
  },
  addCard: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ef2b2d',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  seeMoreCard: {
    width: 120,
    height: 100,
    backgroundColor: '#f8f8f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#494949ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111114',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
