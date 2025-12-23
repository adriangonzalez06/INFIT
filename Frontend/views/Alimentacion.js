import React, { useState, useEffect } from 'react';
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
import { getAllMeals } from '../src/services/MealsService';

export default function Alimentacion() {

  const navigation = useNavigation();

  {/*platos desde Firestore*/ }
  const [allDishes, setAllDishes] = useState([]);

  {/*cargar platos desde Firestore al montar el componente*/ }
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const meals = await getAllMeals();
        if (meals && meals.length > 0) {
          const dishesFromDB = meals.map((meal, index) => 
            new Dish(
              meal.id || index,
              meal.name,
              meal.imgUrl || require('../assets/images/images_dish/dish_01.jpg'),
              meal.macronutrients || 0,
              meal.ingredients || [],
              meal.calories || 0,
              meal.vegetarian || false,
              meal.vegan || false,
              meal.gluten_free || false
            )
          );
          setAllDishes(dishesFromDB);
          console.log('✅ Platos cargados en Alimentacion:', dishesFromDB.length);
        } else {
          // Si no hay platos, usar fallback
          console.warn('⚠️  No se obtuvieron platos, usando fallback');
          setAllDishes([]);
        }
      } catch (error) {
        console.error('❌ Error cargando platos:', error);
        setAllDishes([]);
      }
    };

    loadMeals();
  }, []);

  {/* diets de prueba - usar platos dinámicos */}
  const createDefaultDiets = () => {
    // Si no hay platos, crear fallback
    let dishes = allDishes;
    if (dishes.length === 0) {
      dishes = [
        new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false),
        new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
        new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
        new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
        new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false),
        new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
      ];
    }
    
    const p1 = dishes[0] || new Dish(1, "Plato 1", require('../assets/images/images_dish/dish_01.jpg'), 400, [], 500, false, false, false);
    const p2 = dishes[1] || new Dish(2, "Plato 2", require('../assets/images/images_dish/dish_02.jpg'), 400, [], 500, false, false, false);
    const p3 = dishes[2] || new Dish(3, "Plato 3", require('../assets/images/images_dish/dish_03.jpg'), 400, [], 500, false, false, false);
    const p4 = dishes[3] || new Dish(4, "Plato 4", require('../assets/images/images_dish/dish_04.jpg'), 400, [], 500, false, false, false);
    const p5 = dishes[4] || new Dish(5, "Plato 5", require('../assets/images/images_dish/dish_05.jpg'), 400, [], 500, false, false, false);
    const p6 = dishes[5] || new Dish(6, "Plato 6", require('../assets/images/images_dish/dish_06.jpg'), 400, [], 500, false, false, false);
    
    let r1 = new Diet(1, "Dieta Balanceada", "descripcion", require('../assets/images/images_diet/diet_02.jpg'), [[p2, p3, p6], [p6, p4, p5], [p5, p4, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    let r2 = new Diet(2, "Dieta Vegana", "descripcion", require('../assets/images/images_diet/diet_02.jpg'), [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    let r3 = new Diet(3, "Dieta Cetogénica", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    let r4 = new Diet(4, "Dieta Mediterránea", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    let r5 = new Diet(5, "Dieta Alta en Proteínas", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    let r6 = new Diet(6, "Dieta Baja en Carbohidratos", "descripcion", require('../assets/images/images_diet/diet_01.jpg'), [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);

    return [r1, r2, r3, r4, r5, r6];
  };

  let defaultDiets = createDefaultDiets();
  let g1 = new DietGroup(1, "Trending", defaultDiets);
  let g2 = new DietGroup(2, "Mis dietas", defaultDiets.slice(2, 5), true);
  let g3 = new DietGroup(3, "Para ganar músculo", defaultDiets.slice(0, 5));

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

            <ImageBackground source={typeof diet.imgUrl === 'number' ? diet.imgUrl : { uri: diet.imgUrl }} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
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
        // Pass diet inside the params object so AddDietMenu receives it as route.params.diet
        navigation.navigate('AddDietMenu', { diet });
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
    // Send group recipes in params so AddDietMenu can read route.params.recipes
    navigation.navigate('AddDietMenu', { recipes: group.recipes ?? group });
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

