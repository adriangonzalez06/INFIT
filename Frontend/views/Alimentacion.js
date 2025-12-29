import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet.js';
import colors from './colors.js';
import Dish from '../src/objects/Dish.js'; 
import Diet from '../src/objects/Diet.js';
import DietView from './DietView.js';
import DietGroup from '../src/objects/DietGroup.js';
import { getAllMeals } from '../src/services/MealsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Alimentacion() {
  const navigation = useNavigation();

  {/*platos desde Firestore*/ }
  const [allDishes, setAllDishes] = useState([]);
  
  {/*dietas personalizadas del usuario*/ }
  const [userPersonalizedDiets, setUserPersonalizedDiets] = useState([]);

  {/*cargar dietas personalizadas del usuario cuando se enfoca la pantalla*/ }
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      
      const loadUserPersonalizedDiets = async () => {
        try {
          const userDocId = await AsyncStorage.getItem("userDocId");
          if (!userDocId) {
            console.warn('⚠️ No se encontró userDocId');
            return;
          }

          // Usar 10.0.2.2 para emulador Android, localhost para otros
          const host = '10.0.2.2'; // Android emulator
          const port = '8082';
          const url = `http://${host}:${port}/api/infopersonalizeddiet/user/${userDocId}`;
          
          console.log('📥 Cargando dietas de:', url);
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error('Error al cargar dietas personalizadas');
          }

          const diets = await response.json();
          console.log('✅ Dietas personalizadas cargadas:', diets.length);
          
          if (isMounted) {
            setUserPersonalizedDiets(diets || []);
          }
        } catch (error) {
          console.error('❌ Error cargando dietas personalizadas:', error);
          if (isMounted) {
            setUserPersonalizedDiets([]);
          }
        }
      };

      // Cargar inmediatamente
      loadUserPersonalizedDiets();

      return () => {
        isMounted = false;
      };
    }, [])
  );

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

  // Inicializar con solo dietas por defecto
  const defaultDiets = createDefaultDiets();
  const [recipesGroups, setRecipesGroups] = useState({
    g1: new DietGroup(1, "Trending", defaultDiets),
    g2: new DietGroup(2, "Mis dietas", defaultDiets.slice(2, 5), true),
    g3: new DietGroup(3, "Para ganar músculo", defaultDiets.slice(0, 5))
  });

  // Actualizar recipesGroups cuando userPersonalizedDiets cambia
  useEffect(() => {
    const defaultDiets = createDefaultDiets();
    
    // Convertir dietas de Firestore a objetos Diet DENTRO del useEffect
    let personalizedDiets = [];
    if (userPersonalizedDiets && userPersonalizedDiets.length > 0) {
      const dietImages = [
        require('../assets/images/images_diet/diet_02.jpg'),
        require('../assets/images/images_diet/diet_01.jpg'),
      ];
      
      personalizedDiets = userPersonalizedDiets.map((dietData, index) => {
        let weeklyDishesArray = [[], [], [], [], [], [], []];
        
        if (dietData.weeklyDishes) {
          if (Array.isArray(dietData.weeklyDishes)) {
            weeklyDishesArray = dietData.weeklyDishes;
          } else if (typeof dietData.weeklyDishes === 'object') {
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
              const dayKey = dayIndex.toString();
              if (dietData.weeklyDishes[dayKey]) {
                weeklyDishesArray[dayIndex] = dietData.weeklyDishes[dayKey];
              }
            }
          }
        }
        
        // Usar una imagen de las disponibles (rotando entre diet_01 y diet_02)
        const imageIndex = index % dietImages.length;
        
        return new Diet(
          dietData.id,
          dietData.name,
          dietData.description || '',
          dietImages[imageIndex],
          weeklyDishesArray
        );
      });
    }
    
    const g1 = new DietGroup(1, "Trending", [...defaultDiets]);
    const g2 = new DietGroup(2, "Mis dietas", personalizedDiets.length > 0 ? [...personalizedDiets] : [...defaultDiets.slice(2, 5)], true);
    const g3 = new DietGroup(3, "Para ganar músculo", [...defaultDiets.slice(0, 5)]);

    setRecipesGroups({
      g1, g2, g3
    });
  }, [userPersonalizedDiets]);

  const [diets, setDiet] = useState([]);

  const renderGrupo = (group) => (
    <View style={styles.grupoContainer}>
      {/* group title */}
      <Text style={styles.grupoTitulo}>{group.name}</Text>
      {/* recipes row */}
      <View style={styles.recetasRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* map displays a list of the items that are inside the function */}
          {group.recipes.slice(0,3).map((diet) => {
            return renderRecetaCard(diet);
          })}
          
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
    // Convertir diet a objeto plano si es una instancia de Diet
    const dietObj = {
      id: diet.id,
      name: diet.name,
      description: diet.description,
      imgUrl: diet.imgUrl,
      weeklyDishes: diet.weeklyDishes
    };
    
    // Determinar la imagen: si es un número (require), usarlo directamente; si es string, tratarlo como URI
    let imageSource;
    if (typeof dietObj.imgUrl === 'number') {
      imageSource = dietObj.imgUrl;
    } else if (typeof dietObj.imgUrl === 'string') {
      imageSource = { uri: dietObj.imgUrl };
    } else {
      // Si no es válido, usar imagen por defecto
      imageSource = require('../assets/images/images_diet/diet_02.jpg');
    }
    
    return (
          <TouchableOpacity
            key={dietObj.id}
            style={[styles.recipeCards, styles.recetaCard]}
            onPress={() => {
              handleEnterDiet(dietObj);
            }}>

            <ImageBackground source={imageSource} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>{dietObj.name}</Text>
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

