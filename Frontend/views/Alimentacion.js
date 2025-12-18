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
import DietView from './DietView.js';
import DietGroup from '../src/objects/DietGroup.js';

export default function Alimentacion() {

  const navigation = useNavigation();

  {/*platos placeholder, leer los datos de la base de datos*/}
  let plato1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  let plato2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  let plato3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);
  let plato4 = new Dish(4, "Pescado", "url4", 600, ["ingrediente1", "ingrediente2"], 600, false, false, false);
  let plato5 = new Dish(5, "Sopa", "url5", 300, ["ingrediente1", "ingrediente2"], 300, true, true, true);
  let plato6 = new Dish(6, "Pasta", "url6", 700, ["ingrediente1", "ingrediente2"], 700, false, true, false);

  {/* diets de prueba*/}
  let r1 = new Diet(1, "Dieta Balanceada", "descrtyddtdrthdtjdftdyjtfhfipcion", "url1", [plato1, plato2, plato3]);
  let r2 = new Diet(2, "Dieta Vegana", "descripcion", "url2", [plato2, plato3, plato6],);
  let r3 = new Diet(3, "Dieta Cetogénica", "descripcion", "url3", [plato4, plato5]);
  let r4 = new Diet(4, "Dieta Mediterránea", "descripcion", "url4", [plato5, plato1, plato6]);
  let r5 = new Diet(5, "Dieta Alta en Proteínas", "descripcion", "url5", [plato3]);
  let r6 = new Diet(6, "Dieta Baja en Carbohidratos", "descripcion", "url6", [plato5]);

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
          {group.recipes.slice(0,3).map((diet) => (
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

  {/* render a card*/}
  const renderRecetaCard = (diet) => {
    return (
          <TouchableOpacity
            key={diet.id}
            style={[styles.recipeCards, styles.recetaCard]}
            onPress={() => {
              handleEnterDiet(diet);
            }}>

            <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>{diet.name}</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
            </ImageBackground>
          </TouchableOpacity>
    );
  };

  {/* ahow add more card if true */}
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

  {/*Enter a recipe card handler*/}
  const handleEnterDiet = (diet) => {
    if (!diet) {
          console.warn('handleEntrarDiet: diet is undefined');
          return;
        }
        navigation.navigate('Diet', { diet });
  };

  {/*See More button handler*/}
  const handleEnterGrupoCompleto = (group) => {
    navigation.navigate('ListaGrupoRecetas', { 
      name: group.name,
      recipes: group.recipes
    });
  };

  {/*enter the create a new diet menu*/}
  const handleCreateNewDiet = (group) => {
    navigation.navigate('AddDietMenu', group);
  }




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

