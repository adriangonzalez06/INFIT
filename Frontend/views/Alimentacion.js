import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet.js';
import colors from './colors.js';
import Dish from '../src/objects/Dish.js';
import Diet from '../src/objects/Diet.js';
import DietGroup from '../src/objects/DietGroup.js';
import Ingredient from '../src/objects/Ingredient.js';

export default function Alimentacion() {

  const navigation = useNavigation();

  //id, name, imgUrl, calories, fiber, carbohydrates, fat, protein)
  let in1 = new Ingredient(1, "Manzana", "url", 30, 2, 12, 2, 3);
  let in2 = new Ingredient(1, "Carne", "url", 40, 4, 14, 3, 1);

  {/*platos placeholder, leer los datos de la base de datos*/ }
  let plato1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [in1, in2,in1, in2,in1, in2,in1, in2,in1, in2], true, true, false);
  let plato2 = new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), [in2, in2], false, false, true);
  let plato3 = new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), [in1, in1], true, false, false);
  let plato4 = new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), [in1], false, false, true);
  let plato5 = new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), [in2, in2], true, true, false);
  let plato6 = new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), [in1, in2], false, true, false);

  {/* diets de prueba*/ }
  let r1 = new Diet(1, "Dieta Balanceada", "descripcion", require('../assets/images/images_diet/diet_02.jpg'), [[plato2, plato3, plato6], [plato6, plato4, plato5], [plato5, plato4, plato6], [plato2, plato3], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato3]]);
  let r2 = new Diet(2, "Dieta Vegana", "descripcion", require('../assets/images/images_diet/diet_02.jpg'), [[plato2, plato3, plato6], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato2, plato3], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato3]]);
  let r3 = new Diet(3, "Dieta Cetogénica", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[plato2, plato3, plato6], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato2, plato3], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato3]]);
  let r4 = new Diet(4, "Dieta Mediterránea", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[plato2, plato3, plato6], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato2, plato3], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato3]]);
  let r5 = new Diet(5, "Dieta Alta en Proteínas", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[plato2, plato3, plato6], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato2, plato3], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato3]]);
  let r6 = new Diet(6, "Dieta Baja en Carbohidratos", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[plato2, plato3, plato6], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato2, plato3], [plato1, plato2, plato3], [plato5, plato1, plato6], [plato3]]);

  let g1 = new DietGroup(1, "Trending", [r1, r2, r3, r4, r5, r6]);
  let g2 = new DietGroup(2, "Mis dietas", [r3, r4, r2], true);
  let g3 = new DietGroup(3, "Para ganar músculo", [r5, r6, r4, r2, r1]);

  const [recipesGroups] = useState({
    g1, g2, g3
  });

  const [diets, setDiet] = useState([]);

  const renderGrupo = (group) => (


    <View style={styles.grupoContainer}>
      {/* group title */}
      <Text style={styles.grupoTitulo}>{group.name}</Text>
      {/* recipes row */}
      <View style={styles.recetasRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* map displays a list of the items that are inside the function */}
          {group.recipes.slice(0, 3).map((diet) => (
            renderRecetaCard(diet)
          ))}

          {showAddCard(group.canEdit, group)}

          <TouchableOpacity
            style={styles.seeMoreCard}
            onPress={() => handleEnterGrupoCompleto(group)}>
            <Ionicons name="arrow-forward" size={24} color="#111114" />
            <Text style={{ color: '##111114', fontWeight: '600' }}>Ver más</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </View>
  );

  {/* render a card*/ }
  const renderRecetaCard = (diet) => {
    return (
      <TouchableOpacity
        key={diet.id}
        style={[styles.recipeCards, styles.recetaCard]}
        onPress={() => {
          handleEnterDiet(diet);
        }}>

        <ImageBackground source={typeof diet.imgUrl === 'number' ? diet.imgUrl : { uri: diet.imgUrl }} resizeMode="cover" style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden' }}>
          <Text style={styles.recetaTextoTitulo}>{diet.name}</Text>
          <Text style={styles.recetaTexto}>Subtítulo</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  {/* ahow add more card if true */ }
  const showAddCard = (show, group) => {
    console.log("showAddCard: ", group)
    if (show) {
      return (
        <TouchableOpacity style={[styles.addCard]} onPress={() => handleCreateNewDiet(group)}>
          <Ionicons name="add" size={32} color="#ef2b2d" />
        </TouchableOpacity>
      );
    }
    return null;
  }

  {/*Enter a recipe card handler*/ }
  const handleEnterDiet = (diet) => {
    if (!diet) {
      console.warn('handleEntrarDiet: diet is undefined');
      return;
    }
    // Pass diet inside the params object so AddDietMenu receives it as route.params.diet
    navigation.navigate('AddDietMenu', { diet });
  };

  {/*See More button handler*/ }
  const handleEnterGrupoCompleto = (group) => {
    navigation.navigate('ListaGrupoRecetas', {
      name: group.name,
      recipes: group.recipes
    });
  };

  {/*enter the create a new diet menu*/ }
  const handleCreateNewDiet = (group) => {
    // Send group recipes in params so AddDietMenu can read route.params.recipes
    navigation.navigate('AddDietMenu', { recipes: group.recipes ?? group });
  }

  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>

        {/* go back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>

        {/* title */}
        <Text style={styles.title}>Alimentación</Text>
      </View>


      {/* render groups */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

