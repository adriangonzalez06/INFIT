import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import colors from './colors.js';
import Dish from '../objects/Dish'; 
import Recipe from '../objects/Recipe';
import RecpieView from './RecipeView';
import RecipeGroup from '../objects/RecipeGroup';

export default function Alimentacion() {

  const navigation = useNavigation();

  {/*platos placeholder, leer los datos de la base de datos*/}
  console.log('debug', Dish, Recipe);
  let plato1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  let plato2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  let plato3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);
  let plato4 = new Dish(4, "Pescado", "url4", 600, ["ingrediente1", "ingrediente2"], 600, false, false, false);
  let plato5 = new Dish(5, "Sopa", "url5", 300, ["ingrediente1", "ingrediente2"], 300, true, true, true);
  let plato6 = new Dish(6, "Pasta", "url6", 700, ["ingrediente1", "ingrediente2"], 700, false, true, false);

  {/* recetas de prueba*/}
  let r1 = new Recipe(1, "Dieta Balanceada", "descrtyddtdrthdtjdftdyjtfhfipcion", "url1", [plato1, plato2, plato3]);
  let r2 = new Recipe(2, "Dieta Vegana", "descripcion", "url2", [plato2, plato3, plato6],);
  let r3 = new Recipe(3, "Dieta Cetogénica", "descripcion", "url3", [plato4, plato5]);
  let r4 = new Recipe(4, "Dieta Mediterránea", "descripcion", "url4", [plato5, plato1, plato6]);
  let r5 = new Recipe(5, "Dieta Alta en Proteínas", "descripcion", "url5", [plato3]);
  let r6 = new Recipe(6, "Dieta Baja en Carbohidratos", "descripcion", "url6", [plato5]);

  let g1 = new RecipeGroup(1, "Trending", [r1, r2, r3, r4, r5, r6]);
  let g2 = new RecipeGroup(2, "Mis dietas", [r3, r4, r2], true);
  let g3 = new RecipeGroup(3, "Para ganar músculo", [r5, r6, r4, r2, r1]);

  const [recipesGroups] = useState({
    g1, g2, g3
  });

  const renderGrupo = (grupo) => (
    
    <View style={styles.grupoContainer}>
      {/* group title */}
      <Text style={styles.grupoTitulo}>{grupo.name}</Text>
      {/* recipes row */}
      <View style={styles.recetasRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* map displays a list of the items that are inside the function */}
          {grupo.recipes.slice(0,3).map((receta) => (
            renderRecetaCard(receta)
          ))}
          
          {showAddCard(grupo.canEdit)}

          <TouchableOpacity 
          style={styles.seeMoreCard}
          onPress={() => handleEntrarGrupoCompleto(grupo)}>
            <Ionicons name="arrow-forward" size={24} color="#111114" />
            <Text style={{ color: '##111114', fontWeight: '600' }}>Ver más</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </View>
  );

  {/* render a card*/}
  const renderRecetaCard = (receta) => {
    return (
          <TouchableOpacity
            key={receta.id}
            style={[styles.recipeCards, styles.recetaCard]}
            onPress={() => {
              console.log('receeta: ', receta),
              handleEntrarReceta(receta);
            }}>

            <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>{receta.nombre}</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
            </ImageBackground>
          </TouchableOpacity>
    );
  };

  {/* ahow add more card if true */}
  const showAddCard = (show) => {
      if (show) {
        return (
        <TouchableOpacity style={[styles.addCard]}>
          <Ionicons name="add" size={32} color="#ef2b2d" />
        </TouchableOpacity>
      );
    }
    return null;
  }

  {/*Enter a recipe card handler*/}
  const handleEntrarReceta = (receta) => {
    if (!receta) {
          console.warn('handleEntrarReceta: receta is undefined');
          return;
        }
        navigation.navigate('Recipe', { receta });
  };

  {/*See More button handler*/}
  const handleEntrarGrupoCompleto = (grupo) => {
    navigation.navigate('ListaGrupoRecetas', { 
      name: grupo.name,
      recipes: grupo.recipes
    });
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
          {renderGrupo(recipesGroups.g1)}          
          {renderGrupo(recipesGroups.g2)}
          {renderGrupo(recipesGroups.g3)}
          {renderGrupo(recipesGroups.g1)}
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

