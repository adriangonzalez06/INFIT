import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, Image, ImageBackground, Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import { useRoute } from '@react-navigation/native';
import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import Alimentacion from './Alimentacion';
import { SearchMenu } from '../src/components/SearchMenu';
import { WeeklyItemsMenu } from '../src/components/WeeklyItemsMenu';
import { getAllMeals } from '../src/services/MealsService';

const { height } = Dimensions.get('window');


export default function DietView({ route }) {

  const navigation = useNavigation();

  {/*-------CONSTANTES MENU DESPLEGABLE--------*/ }
  {/*SearchMenu ref para abrirlo desde el boton*/ }
  const searchMenuRef = useRef(null);

  // Rehydrate route params into a Diet instance so instance methods work
  const diet = useMemo(() => Diet.from(route?.params), [route?.params]);
  console.log('diet:', diet);

  {/*dishes desde Firestore*/ }
  const [allAvailableDishes, setAllAvailableDishes] = useState([]);
  const [dishes, setDishes] = useState([]);

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
              [],  // Don't pass Firestore string ingredients - use dish macros instead
              meal.vegetarian || false,
              meal.vegan || false,
              meal.gluten_free || false,
              meal.calories || meal.kcal || 0,
              meal.fiber || 0,
              meal.carbs || 0,
              meal.fat || 0,
              meal.protein || 0
            )
          );
          setAllAvailableDishes(dishesFromDB);

          // Obtener platos de la dieta
          let dietDishes = diet.getAllDishes ? diet.getAllDishes() : dishesFromDB.slice(0, 3);

          // Enriquecer platos de Firestore con imgUrl buscando en dishesFromDB
          if (dietDishes.length > 0) {
            dietDishes = dietDishes.map(dishFromDiet => {
              // Buscar el plato completo en dishesFromDB por ID o por nombre
              const completeDish = dishesFromDB.find(d => d.id === dishFromDiet.id || d.name === dishFromDiet.name);
              if (completeDish && !dishFromDiet.imgUrl) {
                // Crear un nuevo Dish con todos los detalles
                return new Dish(
                  dishFromDiet.id,
                  dishFromDiet.name,
                  completeDish.imgUrl,
                  dishFromDiet.ingredients || completeDish.ingredients || [],
                  dishFromDiet.vegetarian !== undefined ? dishFromDiet.vegetarian : completeDish.vegetarian,
                  dishFromDiet.vegan !== undefined ? dishFromDiet.vegan : completeDish.vegan,
                  dishFromDiet.gluten_free !== undefined ? dishFromDiet.gluten_free : completeDish.gluten_free,
                  dishFromDiet.calories !== undefined ? dishFromDiet.calories : completeDish.calories || dishFromDiet.kcal || completeDish.kcal || 0,
                  dishFromDiet.fiber !== undefined ? dishFromDiet.fiber : completeDish.fiber || 0,
                  dishFromDiet.carbs !== undefined ? dishFromDiet.carbs : completeDish.carbs || 0,
                  dishFromDiet.fat !== undefined ? dishFromDiet.fat : completeDish.fat || 0,
                  dishFromDiet.protein !== undefined ? dishFromDiet.protein : completeDish.protein || 0
                );
              }
              return dishFromDiet;
            });
          }

          setDishes(dietDishes.length > 0 ? dietDishes : dishesFromDB.slice(0, 3));
          console.log('✅ Platos cargados en DietView:', dishesFromDB.length);
        } else {
          // Fallback con platos de ejemplo
          const fallbackDishes = [
            new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [], true, true, false),
            new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), [], false, false, false),
            new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), [], false, false, false),
          ];
          setAllAvailableDishes(fallbackDishes);
          setDishes(fallbackDishes);
        }
      } catch (error) {
        console.error('❌ Error cargando platos:', error);
        const dietDishes = diet.getAllDishes ? diet.getAllDishes() : [];
        setDishes(dietDishes);
      }
    };

    loadMeals();
  }, [diet]);



  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>{diet?.name ?? 'Dieta'}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          <View style={styles.grupoContainer}>

            <Text style={styles.text}>{diet?.description ?? ''}</Text>

            <Text style={styles.grupoTitulo}>Platos</Text>

          </View>
        </SafeAreaView>
      </ScrollView>

      <SearchMenu
        ref={searchMenuRef}
        data={allAvailableDishes}
        title="Buscar platos"
        searchFields={["name", "nombre"]}
        //renderCustomItem={renderDishItemMenu}
        //onSelectItem={handleAddDish}
        searchPlaceholder="Buscar plato..."
        height={height}
      />


    </View>

  );
}

