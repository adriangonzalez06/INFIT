import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView, ImageBackground
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';

export default function ListaGrupoRecetas({ route }) {
  const navigation = useNavigation();

  console.log('route: ', route.params);

  const { name, recipes } = route?.params || { name: '', recipes: [] };

  console.log('grupo asignado: ', name);

    {/* render a card*/}
    const renderRecetaCard = (receta) => {
      return (
            <TouchableOpacity
              key={receta.id}
              style={[styles.recipeCards, styles.recetaCardGroup]}
              onPress={() => {
                handleEntrarReceta(receta);
              }}>
  
              <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
                <Text style={styles.recetaTextoTitulo}>{receta.nombre}</Text>
                <Text style={styles.recetaTexto}>Subtítulo</Text>
              </ImageBackground>

            </TouchableOpacity>
      );
    };

  {/*Enter a recipe card handler*/}
  const handleEntrarReceta = (receta) => {
    if (!receta) {
          console.warn('handleEntrarReceta: receta is undefined');
          return;
        }
        navigation.navigate('Recipe', { receta });
  };

  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>{name}</Text>

      {/* render groups */}
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {recipes.map((receta) => (
            renderRecetaCard(receta)
          ))}

      </ScrollView>
    </View>

  );
}