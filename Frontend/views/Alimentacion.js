import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import colors from './colors.js';

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
            <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recetaCard} onPress={() => navigation.navigate("Receta")}>
            <ImageBackground source={require('../assets/images/images_diet/diet_02.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity 
          style={styles.seeMoreCard}
          onPress={() => handleEntrarGrupoCompleto()}>
            <Ionicons name="arrow-forward" size={24} color="#111114" />
            <Text style={{ color: '##111114', fontWeight: '600' }}>Ver más</Text>
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

        <ScrollView style="alignItems: 'center'; justifyContent: 'center';" horizontal showsHorizontalScrollIndicator={false}>



          <TouchableOpacity style={[styles.recetaCard, styles.shadow]} onPress={() => navigation.navigate("Receta")}>
            <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
            </ImageBackground>
          </TouchableOpacity> 

          <TouchableOpacity style={[styles.recetaCard, styles.shadow]} onPress={() => navigation.navigate("Receta")}>
            <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtitulo</Text>
            </ImageBackground>
          </TouchableOpacity> 

          <TouchableOpacity style={[styles.addCard]}>
            <Ionicons name="add" size={32} color="#ef2b2d" />
          </TouchableOpacity>


          <TouchableOpacity style={styles.seeMoreCard}>
            <Ionicons name="arrow-forward" size={24} color="##111114" />
            <Text style={{ color: '##111114', fontWeight: '600' }}>Ver más</Text>
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
          {renderGrupoAdd('Mis dietas', recetas.grupo2, 'grupo2')}
          {renderGrupo('Para ganar músculo', recetas.grupo3, 'grupo3')}
          {renderGrupo('Para mantener la figura', recetas.grupo4, 'grupo4')}
          {renderGrupo('Para mantener la figura', recetas.grupo5, 'grupo5')}
          {renderGrupo('Para mantener la figura', recetas.grupo6, 'grupo6')}
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

