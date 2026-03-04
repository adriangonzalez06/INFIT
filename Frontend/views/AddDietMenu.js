import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, Image, ImageBackground, Dimensions, ToastAndroid
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import { SearchMenu } from '../src/components/SearchMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alimentacion from './Alimentacion';
import { getAllMeals, getUserMeals } from '../src/services/MealsService';

import Header from '../src/components/Header';
import colors from './colors';
import Ingredient from '../src/objects/Ingredient';
import RenderLabels from '../src/components/RenderLabels.js';
import { LabelTextInput } from '../src/components/LabelTextInput';
import { BACKEND_URL } from '../src/config';
import AppModal from './AppModal';


export default function AddDietMenu({ route }) {

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

  /* id, name, imgUrl, calories, fiber, carbohydrates, fat, protein) */
  {/*id, name, imgUrl, calories, fiber, carbohydrates, fat, protein)*/ }
  let in1 = new Ingredient(1, "Manzana", 30, 2, 12, 2, 3);
  let in2 = new Ingredient(2, "Carne", 40, 4, 14, 3, 1);

  let ingredients = [
    { ingredient: in1, grams: 100 },
    { ingredient: in2, grams: 100 }
  ];

  const images = [
    {
      id: 1,
      name: 'fruta fitness saludable',
      url: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg'
    },
    {
      id: 2,
      name: 'bascula perder peso',
      url: 'https://images.pexels.com/photos/53404/scale-diet-fat-health-53404.jpeg'
    },
    {
      id: 3,
      name: 'Comida fitness fruta',
      url: 'https://img.freepik.com/foto-gratis/lay-flat-ensalada-botella-jugo_23-2148262146.jpg?semt=ais_hybrid&w=740&q=80'
    },
    {
      id: 4,
      name: 'pollo arroz',
      url: 'https://images.pexels.com/photos/105588/pexels-photo-105588.jpeg'
    },
    {
      id: 5,
      name: 'pollo arroz',
      url: 'https://images.pexels.com/photos/35367044/pexels-photo-35367044.jpeg'
    },
    {
      id: 6,
      name: 'huevo codorniz',
      url: 'https://images.pexels.com/photos/6701181/pexels-photo-6701181.jpeg'
    },
    {
      id: 7,
      name: 'proteina pescado carne huevos proteico',
      url: 'https://img.freepik.com/foto-gratis/vista-arriba-verdadera-piramide-alimentaria_23-2150238929.jpg'
    },
    {
      id: 8,
      name: 'gym gimnasio pesa fuerza musculo',
      url: 'https://img.freepik.com/foto-gratis/pesos-ejercicio-pesas-fuerte-atletica_1139-709.jpg'
    },
    {
      id: 9,
      name: 'perder peso',
      url: 'https://img.freepik.com/foto-gratis/mujer-midiendo-su-barriga-peso_53876-13564.jpg'
    },
    {
      id: 10,
      name: 'perder peso',
      url: 'https://img.freepik.com/foto-gratis/vista-angulo-alto-vegetales-crudos-pesas-sobre-fondo-madera_23-2147882042.jpg'
    },

  ];

  /* array de dietas al que añadir la dieta */
  /* Asegurarse de que addingGroup sea siempre un array (maneja route.params undefined/null y valores no array) */
  {/*platos placeholder, leer los datos de la base de datos*/ }
  let dish1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), ingredients, true, true, false);
  let dish2 = new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), ingredients, false, false, true);
  let dish3 = new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), ingredients, true, false, false);
  let dish4 = new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), ingredients, false, false, true);
  let dish5 = new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), ingredients, true, true, false);
  let dish6 = new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), ingredients, false, true, false);

  {/*array de dietas al que añadir la dieta*/ }
  {/*Asegurarse de que addingGroup sea siempre un array (maneja route.params undefined/null y valores no array)*/ }
  const addingGroup = Array.isArray(route?.params?.recipes) ? route.params.recipes : [];

  /* Rehydrate route.params.diet into a Diet instance so instance methods work */
  const diet = useMemo(() => {
    try {
      const rawDiet = route?.params?.diet ?? null;
      return Diet.from(rawDiet);
    } catch (e) {
      console.warn('Error rehydrating diet from params:', e.message);
      return Diet.from(null);
    }
  }, [route?.params?.diet]);

  /* If getName is null it means that we are creating a recipe */
  let creatingRecipe = false;
  if (diet.getName() == null) creatingRecipe = true;

  /* isPersonalized: viene de Alimentacion cuando se pulsa "Editar dieta" */
  const isPersonalized = route?.params?.isPersonalized ?? false;
  /* canEdit: mostrar controles de edición tanto al crear como al editar dieta propia */
  const canEdit = creatingRecipe || isPersonalized;

  /* array de todos los platos desde Firestore */
  const [allAvailableDishes, setAllAvailableDishes] = useState([]);
  {/*array de mis platos creados por el usuario*/ }
  const [myDishes, setMyDishes] = useState([]);

  {/*función para cargar platos desde Firestore*/ }
  const loadMeals = async () => {
    try {
      // Obtener userID del AsyncStorage
      const userDocId = await AsyncStorage.getItem("userDocId");

      const meals = await getAllMeals();
      if (meals && meals.length > 0) {
        console.log('📊 Primera comida de Firestore:', JSON.stringify(meals[0], null, 2));
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
        console.log('✅ Platos cargados en AddDietMenu:', dishesFromDB.length);
        console.log('📋 Primer plato objeto:', dishesFromDB[0]);
        setAllAvailableDishes(dishesFromDB);

        // Cargar solo los platos del usuario actual para "Mis platos"
        if (userDocId) {
          const userMealsData = await getUserMeals(userDocId);
          if (userMealsData && userMealsData.length > 0) {
            const userDishesFromDB = userMealsData.map((meal, index) =>
              new Dish(
                meal.id || index,
                meal.name,
                meal.imgUrl || require('../assets/images/images_dish/dish_01.jpg'),
                [],
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
            console.log(`✅ Platos del usuario cargados: ${userDishesFromDB.length}`);
            setMyDishes(userDishesFromDB);
          } else {
            console.log('ℹ️ El usuario no tiene platos creados aún');
            setMyDishes([]);
          }
        }

        // Enriquecer dieta existente con macros de Firestore
        if (!creatingRecipe && diet && diet.weeklyDishes) {
          const enrichedWeeklyDishes = diet.weeklyDishes.map(dayDishes =>
            (dayDishes || []).map(dishFromDiet => {
              // Buscar este dish en los meals de Firestore
              const firebaseDish = dishesFromDB.find(d => d.id === dishFromDiet.id || d.name === dishFromDiet.name);
              if (firebaseDish && (!dishFromDiet.fiber && !dishFromDiet.carbs && !dishFromDiet.fat && !dishFromDiet.protein)) {
                // Si el dish no tiene macros pero lo encontramos en Firestore, copiarlos
                console.log(`🔄 Enriqueciendo ${dishFromDiet.name} con macros de Firestore`);
                return new Dish(
                  dishFromDiet.id,
                  dishFromDiet.name,
                  dishFromDiet.imgUrl || firebaseDish.imgUrl,
                  [],
                  dishFromDiet.vegetarian,
                  dishFromDiet.vegan,
                  dishFromDiet.gluten_free,
                  firebaseDish.calories,
                  firebaseDish.fiber,
                  firebaseDish.carbs,
                  firebaseDish.fat,
                  firebaseDish.protein
                );
              }
              return dishFromDiet;
            })
          );
          diet.weeklyDishes = enrichedWeeklyDishes;
          // Actualizar estado de dishes con los datos enriquecidos
          setDishes(diet.getDishesForDay(0));
          setAllDishes(diet.getAllDishes());
        }

      } else {
        // Si no hay platos de Firestore, usar fallback
        const fallbackDishes = [
          new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [], true, true, false),
          new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), [], false, false, false),
          new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), [], false, false, false),
          new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), [], false, false, false),
          new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), [], true, true, false),
          new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), [], false, false, false),
        ];
        setAllAvailableDishes(fallbackDishes);
        setMyDishes([]);
        console.log('⚠️  Usando platos de fallback');
      }
    } catch (error) {
      console.error('❌ Error cargando platos:', error);
      // Fallback en caso de error
      const fallbackDishes = [
        new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [], true, true, false),
        new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), [], false, false, false),
        new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), [], false, false, false),
      ];
      setAllAvailableDishes(fallbackDishes);
      setMyDishes([]);
    }
  };

  {/*cargar platos cuando la pantalla se enfoca (cada vez que vuelves a esta pantalla)*/ }
  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
    }, [creatingRecipe, diet])
  );

  {/*datos de la dieta*/ }
  {/*selectedDay: 0 = Lunes, 1 = Martes, ... 6 = Domingo*/ }
  const [selectedDay, setSelectedDay] = useState(0);
  const [dishes, setDishes] = useState(diet.getDishesForDay(0));
  const [dietName, setDietName] = useState(route?.params?.diet?.name || '');
  const [dietDescription, setDietDescription] = useState(route?.params?.diet?.description || '');
  const [selectedUri, setSelectedUri] = useState(route?.params?.diet?.imgUrl || images[0].url || null);
  const [darkMode, setDarkMode] = useState(false);
  const [appModal, setAppModal] = useState({ visible: false, type: 'info', title: '', message: '' });
  const showAppModal = (type, title, message) => setAppModal({ visible: true, type, title, message });
  const hideAppModal = () => setAppModal(m => ({ ...m, visible: false }));

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  {/*all dishes of all days*/ }
  const [allDishes, setAllDishes] = useState(diet.getAllDishes());

  {/*Totales de la diet*/ }
  const totalCalories = (dishes.reduce((sum, p) => sum + (p?.calories || 0), 0));
  const totalFiber = (dishes.reduce((sum, p) => sum + (p?.fiber || 0), 0));
  const totalCarbs = (dishes.reduce((sum, p) => sum + (p?.carbs || 0), 0));
  const totalFat = (dishes.reduce((sum, p) => sum + (p?.fat || 0), 0));
  const totalProtein = (dishes.reduce((sum, p) => sum + (p?.protein || 0), 0));

  {/*modal ingredients*/ }
  const [visible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  {/*button color*/ }
  const [bttId, setBttId] = useState(0);

  {/*titulo crear dieta o nombre de la dieta*/ }
  const screenTitle = diet.getName() || "Crear una dieta";

  {/*gestion de imagenes locales y remotas*/ }
  {/*comprobar de donde vienen*/ }
  const getImageSource = (imgUrl) => {
    if (!imgUrl) return null;

    return typeof imgUrl === 'number'
      ? imgUrl
      : { uri: imgUrl };
  };

  {/*-------CONSTANTES MENU DESPLEGABLE--------*/ }
  {/*SearchMenu ref para abrirlo desde el boton*/ }
  const searchMenuRef = useRef(null);
  const imgMenuRef = useRef(null);

  {/*-------FUNCIONES DE MENU DESPLEGABLE--------*/ }
  {/*componente personalizado para renderizar items en el SearchMenu*/ }
  const renderDishItemMenu = ({ item }) => (
    <TouchableOpacity onPress={() => { handleAddDish(item); searchMenuRef.current?.cerrarMenu?.(); }}>
      <View style={[styles.dishContainer, darkMode && styles.darkDishContainer, { marginBottom: 10 }]}>
        <Image
          style={[styles.dishImage, { width: 80, height: 80, borderRadius: 8 }]}
          source={typeof item.imgUrl === 'number' ? item.imgUrl : { uri: item.imgUrl }}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={[styles.dishTitle, darkMode && styles.darkDishTitle, { fontSize: 16 }]}>{item.name}</Text>
          <Text style={[styles.dishText, darkMode && styles.darkDishText]}>{item.getTotalCalories()} kcal</Text>
          {/*render labels vegano vegetariano*/}
          <RenderLabels dish={item} />
        </View>
      </View>
    </TouchableOpacity>
  );


  const renderImageItemMenu = ({ item }) => (
    <TouchableOpacity onPress={() => { handleSetImage(item.url); imgMenuRef.current?.cerrarMenu?.(); }} style={styles.chooseImage}>
      <View style={{ flexDirection: 'row' }}>

        <Image
          source={{ uri: item.url }}
          style={styles.gridImage}
        />

      </View>
    </TouchableOpacity>
  );

  const handleSetImage = (url) => {
    setSelectedUri(url);
    diet.setUrl(url);
  };

  {/*-------FUNCIONES DE LOS PLATOS--------*/ }
  {/*funcion para agregar un plato a la dieta*/ }
  const handleAddDish = (selectedDish) => {

    {/*evitar añadir el mismo plato varias veces al día*/ }
    const dayDishes = diet.getDishesForDay(selectedDay);
    if (dayDishes.some(d => d.id === selectedDish.id)) {
      ToastAndroid.show('Este plato ya está en el día seleccionado.', ToastAndroid.SHORT);
      return;
    };

    {/*Asegurar que el plato tenga todas las propiedades de macros*/ }
    const dishToAdd = selectedDish instanceof Dish ? selectedDish : new Dish(
      selectedDish.id,
      selectedDish.name,
      selectedDish.imgUrl || require('../assets/images/images_dish/dish_01.jpg'),
      selectedDish.ingredients || [],
      selectedDish.vegetarian || false,
      selectedDish.vegan || false,
      selectedDish.gluten_free || false,
      selectedDish.calories || selectedDish.kcal || 0,
      selectedDish.fiber || 0,
      selectedDish.carbs || 0,
      selectedDish.fat || 0,
      selectedDish.protein || 0
    );

    {/*Añade el plato al día seleccionado dentro de newDiet*/ }
    diet.addDishToDay(selectedDay, dishToAdd);
    {/*Actualiza el estado local para re-renderizar la lista del día*/ }
    setDishes([...diet.getDishesForDay(selectedDay)]);
    setAllDishes([...diet.getAllDishes()]);
  };

  {/*funcion para eliminar un plato a la dieta*/ }
  const handleDeleteDish = (index) => {
    {/*borra por índice del día seleccionado*/ }
    diet.weeklyDishes[selectedDay].splice(index, 1);
    setDishes([...diet.getDishesForDay(selectedDay)]);
    setAllDishes([...diet.getAllDishes()]);
  };

  {/*funcion para renderizar la list de dishes*/ }
  const renderDishList = () => {
    return (dishes || []).map((dish, idx) => renderPlato(dish, idx));
  };

  {/*funcion para renderizar cada dish de la diet*/ }
  const renderPlato = (dish, index) => {

    console.log("tiene id?", dish);

    return (
      <TouchableOpacity key={dish.id} onPress={() => showModal(dish.getIngredientsWithGrams())}>
        <View style={[styles.dishContainer, darkMode && styles.darkDishContainer]}>
          <Image
            style={styles.dishImage}
            source={typeof dish.imgUrl === 'number' ? dish.imgUrl : { uri: dish.imgUrl }}
          />
          <View style={{ margin: 5, flex: 1 }}>
            <Text style={[styles.dishTitle, darkMode && styles.darkDishTitle]}>{dish.name}</Text>
            <Text style={styles.dishSubtitle}>Calorías</Text>
            <Text style={[styles.dishText, darkMode && styles.darkDishText]}>{calculateDishTotals(dish).totalCalories} kcal</Text>


            {/*etiquetas de vegetariano, vegano y sin gluten*/}
            <RenderLabels dish={dish} />

          </View>
        </View>
      </TouchableOpacity>
    );
  };


  {/*-------FUNCIONES DE LOS INGREDIENTES--------*/ }

  {/*funciones para mostrar/ocultar modal ingredients*/ }
  const showModal = (ingredients) => {
    setSelectedIngredients(ingredients);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedIngredients([]);
  };

  {/*renderizar lista de ingredientes dentro del modal*/ }
  const renderIngredientsModal = () => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
      <View style={[styles.modalOverlay, darkMode && { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <View style={[styles.modalContent, darkMode && { backgroundColor: colors.bg_dark, borderColor: '#333', borderWidth: 1 }]}>
          <ScrollView>
            <Text style={[styles.grupoTitulo, darkMode && styles.darkText]}>Ingredientes</Text>


            {Array.isArray(selectedIngredients) &&
              selectedIngredients.map((item) => renderIngredientObject(item))
            }

            <View style={styles.modalButtons}>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={hideModal} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  {/*renderizar objeto ingrediente para poner en la lista*/ }
  const renderIngredientObject = (item) => {

    if (!item || !item.ingredient) return null;
    const { ingredient, grams } = item;

    return (

      <View key={ingredient.id}>
        <Text style={[styles.title_2, darkMode && styles.darkText]}>{grams}g de {ingredient.name}</Text>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && styles.darkText]}>Calorías</Text>
          <Text style={[styles.text, darkMode && styles.darkText]}>{(ingredient.calories * grams) / 100} kcal</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && styles.darkText]}>Fibra</Text>
          <Text style={[styles.text, darkMode && styles.darkText]}>{(ingredient.fiber * grams) / 100} g</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && styles.darkText]}>Carbohidratos</Text>
          <Text style={[styles.text, darkMode && styles.darkText]}>{(ingredient.carbohydrates * grams) / 100} g</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && styles.darkText]}>Grasas</Text>
          <Text style={[styles.text, darkMode && styles.darkText]}>{(ingredient.fat * grams) / 100} g</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && styles.darkText]}>Proteína</Text>
          <Text style={[styles.text, darkMode && styles.darkText]}>{(ingredient.protein * grams) / 100} g</Text>
        </View>

      </View>
    )
  };


  {/*calcular totales de cada plato para renderizar en su card y en el menu ingredientes*/ }
  const calculateDishTotals = (dish) => {
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    const ingredientsWithGrams = dish?.getIngredientsWithGrams?.() || [];
    console.log('💣 calculateDishTotals:', { dishName: dish?.name, ingredientsCount: ingredientsWithGrams.length, dishCalories: dish?.calories, dishFiber: dish?.fiber, dishCarbs: dish?.carbs });

    if (Array.isArray(ingredientsWithGrams) && ingredientsWithGrams.length > 0) {
      console.log('🥗 Usando ingredientes...');
      // Si hay ingredientes, calcular desde ellos
      ingredientsWithGrams.forEach((item) => {
        if (!item) return;
        const { ingredient, grams } = item;
        if (!ingredient) return;
        totalCalories += ((ingredient.calories || 0) * (grams || 0)) / 100;
        totalFiber += ((ingredient.fiber || 0) * (grams || 0)) / 100;
        totalCarbs += ((ingredient.carbohydrates || 0) * (grams || 0)) / 100;
        totalFat += ((ingredient.fat || 0) * (grams || 0)) / 100;
        totalProtein += ((ingredient.protein || 0) * (grams || 0)) / 100;
      });
    } else if (dish && (dish.calories !== undefined || dish.fiber !== undefined || dish.carbs !== undefined || dish.fat !== undefined || dish.protein !== undefined)) {
      console.log('♻️ Usando macros del dish:', { cal: dish.calories, fiber: dish.fiber, carbs: dish.carbs, fat: dish.fat, protein: dish.protein });
      // Si no hay ingredientes pero hay macros en el plato, usarlos
      totalCalories = Number(dish.calories) || 0;
      totalFiber = Number(dish.fiber) || 0;
      totalCarbs = Number(dish.carbs) || 0;
      totalFat = Number(dish.fat) || 0;
      totalProtein = Number(dish.protein) || 0;
    } else {
      console.log('⚠️ No hay ingredientes ni macros en el dish:', dish);
    }

    // Validar que no haya NaN
    totalCalories = isNaN(totalCalories) ? 0 : totalCalories;
    totalFiber = isNaN(totalFiber) ? 0 : totalFiber;
    totalCarbs = isNaN(totalCarbs) ? 0 : totalCarbs;
    totalFat = isNaN(totalFat) ? 0 : totalFat;
    totalProtein = isNaN(totalProtein) ? 0 : totalProtein;

    console.log('📊 Totales calculados:', { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein });
    return { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein, }
  };

  {/*-------FUNCIONES DE LOS TOTALES--------*/ }

  {/*funcion para calcular los totales diarios*/ }
  const calculateDailyTotals = (selectedDay) => {
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    const dayDishes = diet.getDishesForDay(selectedDay) || [];
    dayDishes.forEach((dish) => {
      const ingredientsWithGrams = dish?.getIngredientsWithGrams?.() || [];

      if (Array.isArray(ingredientsWithGrams) && ingredientsWithGrams.length > 0) {
        // Si hay ingredientes, calcular desde ellos
        ingredientsWithGrams.forEach((item) => {
          if (!item) return;
          const { ingredient, grams } = item;
          if (!ingredient) return;

          totalCalories += ((ingredient.calories || 0) * (grams || 0)) / 100;
          totalFiber += ((ingredient.fiber || 0) * (grams || 0)) / 100;
          totalCarbs += ((ingredient.carbohydrates || 0) * (grams || 0)) / 100;
          totalFat += ((ingredient.fat || 0) * (grams || 0)) / 100;
          totalProtein += ((ingredient.protein || 0) * (grams || 0)) / 100;
        });
      } else if (dish && (dish.calories !== undefined || dish.fiber !== undefined || dish.carbs !== undefined || dish.fat !== undefined || dish.protein !== undefined)) {
        // Si no hay ingredientes pero hay macros en el plato, usarlos
        totalCalories += Number(dish.calories) || 0;
        totalFiber += Number(dish.fiber) || 0;
        totalCarbs += Number(dish.carbs) || 0;
        totalFat += Number(dish.fat) || 0;
        totalProtein += Number(dish.protein) || 0;
      }
    });

    totalCalories = roundNums(totalCalories);
    totalFiber = roundNums(totalFiber);
    totalCarbs = roundNums(totalCarbs);
    totalFat = roundNums(totalFat);
    totalProtein = roundNums(totalProtein);

    return { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein };
  };


  {/*funcion para calcular los totales semanales*/ }
  const calculateWeeklyTotals = () => {
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    const allWeeklyDishes = diet.getAllDishes() || [];
    allWeeklyDishes.forEach((dayDishes) => {
      (dayDishes || []).forEach((dish) => {
        const ingredientsWithGrams = dish?.getIngredientsWithGrams?.() || [];

        if (Array.isArray(ingredientsWithGrams) && ingredientsWithGrams.length > 0) {
          // Si hay ingredientes, calcular desde ellos
          ingredientsWithGrams.forEach((item) => {
            if (!item) return;
            const { ingredient, grams } = item;
            if (!ingredient) return;

            totalCalories += ((ingredient.calories || 0) * (grams || 0)) / 100;
            totalFiber += ((ingredient.fiber || 0) * (grams || 0)) / 100;
            totalCarbs += ((ingredient.carbohydrates || 0) * (grams || 0)) / 100;
            totalFat += ((ingredient.fat || 0) * (grams || 0)) / 100;
            totalProtein += ((ingredient.protein || 0) * (grams || 0)) / 100;
          });
        } else if (dish && (dish.calories !== undefined || dish.fiber !== undefined || dish.carbs !== undefined || dish.fat !== undefined || dish.protein !== undefined)) {
          // Si no hay ingredientes pero hay macros en el plato, usarlos
          totalCalories += Number(dish.calories) || 0;
          totalFiber += Number(dish.fiber) || 0;
          totalCarbs += Number(dish.carbs) || 0;
          totalFat += Number(dish.fat) || 0;
          totalProtein += Number(dish.protein) || 0;
        }
      });
    });

    totalCalories = roundNums(totalCalories);
    totalFiber = roundNums(totalFiber);
    totalCarbs = roundNums(totalCarbs);
    totalFat = roundNums(totalFat);
    totalProtein = roundNums(totalProtein);

    return { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein };
  };

  {/*redondear numeros para evitar que aparezcan muchos decimales*/ }
  const roundNums = (num) => {
    // Validar que num no sea NaN
    if (isNaN(num)) {
      return "0.00";
    }
    let roundedNum = Math.round(num * 100) / 100
    return roundedNum.toFixed(2);
  };

  const saveDiet = async () => {
    try {
      // Obtener userId del AsyncStorage
      const userDocId = await AsyncStorage.getItem("userDocId");

      console.log('🔐 ============ SAVING DIET ============');
      console.log('🔐 UserDocId from AsyncStorage:', userDocId);

      if (!userDocId) {
        showAppModal('error', 'Sesión no encontrada', 'No se pudo obtener la información del usuario. Por favor inicia sesión nuevamente.');
        return;
      }
      if (!dietName || dietName.trim() === '') {
        showAppModal('warning', 'Nombre requerido', 'Por favor ingresa un nombre para la dieta antes de guardar.');
        return;
      }

      diet.id = Date.now();
      diet.name = dietName.trim();
      diet.description = dietDescription?.trim() || '';
      diet.imgUrl = selectedUri;

      // Convertir weeklyDishes a formato compatible con Firestore (objeto con claves numéricas)
      // Guardamos solo los platos que componen la dieta
      const serializedWeeklyDishes = {};
      diet.weeklyDishes.forEach((dayDishes, dayIndex) => {
        serializedWeeklyDishes[dayIndex.toString()] = (dayDishes || []).map(dish => ({
          id: dish.id,
          name: dish.name,
          imgUrl: dish.imgUrl,
          calories: dish.calories || 0,
          fiber: dish.fiber || 0,
          carbs: dish.carbs || 0,
          fat: dish.fat || 0,
          protein: dish.protein || 0,
          vegetarian: dish.vegetarian || false,
          vegan: dish.vegan || false,
          gluten_free: dish.gluten_free || false,
        }));
      });

      // Preparar datos SIMPLIFICADOS para enviar a la API
      // Solo guardamos: userID, nombre, descripción, imagen y los platos
      const dietToSave = {
        userID: userDocId,
        name: dietName.trim(),
        description: dietDescription?.trim() || '',
        imgUrl: selectedUri,
        weeklyDishes: serializedWeeklyDishes
      };

      const url = `${BACKEND_URL}/api/infopersonalizeddiet`;
      console.log('📤 Enviando dieta a:', url);
      console.log('🔐 UserID siendo enviado:', userDocId);
      console.log('📦 Datos:', JSON.stringify(dietToSave, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dietToSave),
      });

      if (!response.ok) {
        let errorMessage = 'Error al guardar la dieta';
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData.details || errorData.error || '';
        } catch (e) {
          errorMessage = `Error HTTP ${response.status}`;
        }
        console.error('❌ Error response:', errorMessage, errorDetails);
        throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
      }

      const result = await response.json();
      console.log('✅ Dieta guardada:', result);

      // Actualizar el array local también
      addingGroup.push({
        id: result.id,
        ...dietToSave
      });

      setDietName('');
      setDietDescription('');
      setAllDishes([...diet.getAllDishes()]);
      showAppModal('success', '¡Dieta guardada!', 'La dieta personalizada se ha guardado correctamente.');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error saving diet:', err);
      showAppModal('error', 'Error al guardar', err.message || 'No se pudo guardar la dieta. Verifica la conexión al servidor.');
    }
  };

  /* Actualizar dieta personalizada existente (PUT) */
  const updateDiet = async () => {
    try {
      const userDocId = await AsyncStorage.getItem('userDocId');
      if (!userDocId) {
        showAppModal('error', 'Sesión no encontrada', 'No se pudo obtener la información del usuario.');
        return;
      }

      const dietId = route?.params?.diet?.id;
      if (!dietId) {
        showAppModal('error', 'Error', 'No se encontró el ID de la dieta a actualizar.');
        return;
      }

      const serializedWeeklyDishes = {};
      diet.weeklyDishes.forEach((dayDishes, dayIndex) => {
        serializedWeeklyDishes[dayIndex.toString()] = (dayDishes || []).map(dish => ({
          id: dish.id,
          name: dish.name,
          imgUrl: dish.imgUrl,
          calories: dish.calories || 0,
          fiber: dish.fiber || 0,
          carbs: dish.carbs || 0,
          fat: dish.fat || 0,
          protein: dish.protein || 0,
          vegetarian: dish.vegetarian || false,
          vegan: dish.vegan || false,
          gluten_free: dish.gluten_free || false,
        }));
      });

      const updateData = {
        userId: userDocId,
        name: dietName.trim() || diet.getName(),
        description: dietDescription?.trim() || diet.getDesc() || '',
        imgUrl: selectedUri,
        weeklyDishes: serializedWeeklyDishes,
        updatedAt: new Date().toISOString(),
      };

      const url = `${BACKEND_URL}/api/infopersonalizeddiet/${dietId}`;
      console.log('📤 Actualizando dieta:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
      }

      console.log('✅ Dieta actualizada correctamente');
      showAppModal('success', '¡Cambios guardados!', 'La dieta personalizada se ha actualizado correctamente.');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error actualizando dieta:', err);
      showAppModal('error', 'Error al guardar', err.message || 'No se pudo actualizar la dieta.');
    }
  };

  {/*botones y otros elementos*/ }
  const renderNameInput = (canEdit) => {
    if (canEdit) {
      return (
        <View style={{ marginVertical: 15 }}>
          <LabelTextInput
            style={styles.input}
            label="Nombre de la dieta"
            placeholder="Nombre..."
            value={dietName}
            onChangeText={setDietName}
          />
        </View>
      );
    }
    return null;
  };

  const renderAddDishButton = (canEdit) => {
    if (canEdit) {
      return (
        <TouchableOpacity
          style={styles.addDishButton}
          onPress={() => searchMenuRef.current?.abrirMenu()}
        >
          <Text style={{ color: darkMode ? '#fff' : '#111' }}>+ Añadir plato</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderSaveChangesButton = (canEdit) => {
    if (canEdit) {
      return (
        <TouchableOpacity
          style={styles.button}
          onPress={isPersonalized ? updateDiet : saveDiet}
        >
          <Text style={styles.buttonText}>
            {isPersonalized ? 'Guardar Cambios' : 'Guardar Dieta'}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };


  return (
    <>
      <View style={[styles.container, darkMode && { backgroundColor: colors.bg_dark }]}>
        <StatusBar style={darkMode ? 'light' : 'auto'} />

        <Header title={screenTitle} showBackButton={true} darkMode={darkMode} />

        <ScrollView contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: '#111' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.grupoContainer, { paddingHorizontal: 16, paddingTop: 16 }]}>

            {renderNameInput(canEdit)}

            <View style={styles.daysContainer}>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 0 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(0); setDishes(diet.getDishesForDay(0)); setBttId(0); }}><Text style={darkMode && { color: '#fff' }}>L</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 1 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(1); setDishes(diet.getDishesForDay(1)); setBttId(1); }}><Text style={darkMode && { color: '#fff' }}>M</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 2 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(2); setDishes(diet.getDishesForDay(2)); setBttId(2); }}><Text style={darkMode && { color: '#fff' }}>X</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 3 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(3); setDishes(diet.getDishesForDay(3)); setBttId(3); }}><Text style={darkMode && { color: '#fff' }}>J</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 4 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(4); setDishes(diet.getDishesForDay(4)); setBttId(4); }}><Text style={darkMode && { color: '#fff' }}>V</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 5 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(5); setDishes(diet.getDishesForDay(5)); setBttId(5); }}><Text style={darkMode && { color: '#fff' }}>S</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.dayButton, { backgroundColor: 6 === bttId ? colors.light_gray : (darkMode ? '#333' : colors.white) }]} onPress={() => { setSelectedDay(6); setDishes(diet.getDishesForDay(6)); setBttId(6); }}><Text style={darkMode && { color: '#fff' }}>D</Text></TouchableOpacity>
            </View>

            {renderAddDishButton(canEdit)}

            {/*renderizar todos los dishes que haya en el día seleccionado*/}
            {renderDishList()}

            {/* ── PANEL DE TOTALES ── */}
            <Text style={[styles.grupoTitulo, { marginTop: 10, marginBottom: 4 }, darkMode && { color: '#fff' }]}>
              Totales
            </Text>

            {/* Selector Diario / Semanal */}
            {(() => {
              const [totalsTab, setTotalsTab] = React.useState('daily');
              const daily = calculateDailyTotals(selectedDay);
              const weekly = calculateWeeklyTotals();
              const data = totalsTab === 'daily' ? daily : weekly;

              const macros = [
                { label: 'Fibra', value: data.totalFiber, unit: 'g', color: '#4ade80', icon: '🌿' },
                { label: 'Carbohidratos', value: data.totalCarbs, unit: 'g', color: '#facc15', icon: '🌾' },
                { label: 'Grasas', value: data.totalFat, unit: 'g', color: '#f97316', icon: '🧈' },
                { label: 'Proteína', value: data.totalProtein, unit: 'g', color: '#a78bfa', icon: '💪' },
              ];

              return (
                <View style={{ marginBottom: 12 }}>
                  {/* Toggle tabs */}
                  <View style={{
                    flexDirection: 'row',
                    backgroundColor: darkMode ? '#1e1e1e' : '#f0f0f0',
                    borderRadius: 12,
                    padding: 4,
                    marginBottom: 16,
                  }}>
                    {['daily', 'weekly'].map(tab => (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setTotalsTab(tab)}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 10,
                          alignItems: 'center',
                          backgroundColor: totalsTab === tab
                            ? (darkMode ? '#2a2a2a' : '#fff')
                            : 'transparent',
                          shadowColor: totalsTab === tab ? '#000' : 'transparent',
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: totalsTab === tab ? 2 : 0,
                        }}
                      >
                        <Text style={{
                          fontWeight: totalsTab === tab ? '700' : '400',
                          color: totalsTab === tab
                            ? (darkMode ? '#fff' : '#111')
                            : (darkMode ? '#888' : '#777'),
                          fontSize: 14,
                        }}>
                          {tab === 'daily' ? 'Diario' : 'Semanal'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Tarjeta destacada de Calorías */}
                  <View style={{
                    borderRadius: 18,
                    padding: 20,
                    marginBottom: 14,
                    alignItems: 'center',
                    backgroundColor: darkMode ? '#494949ff' : '#fff0f0',
                    borderWidth: 1.5,
                    borderColor: '#ef2b2d44',
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#ef2b2d', marginBottom: 4, letterSpacing: 0.5 }}>
                      CALORÍAS TOTALES
                    </Text>
                    <Text style={{
                      fontSize: 44,
                      fontWeight: '800',
                      color: '#ef2b2d',
                      letterSpacing: -1,
                    }}>
                      {data.totalCalories}
                    </Text>
                    <Text style={{ fontSize: 14, color: darkMode ? '#aaa' : '#888', fontWeight: '500' }}>kcal</Text>
                  </View>

                  {/* Grid 2×2 de macros */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {macros.map((macro) => (
                      <View key={macro.label} style={{
                        flex: 1,
                        minWidth: '45%',
                        backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: darkMode ? '#2a2a2a' : '#f0f0f0',
                        alignItems: 'flex-start',
                      }}>
                        <View style={{
                          backgroundColor: macro.color + '22',
                          borderRadius: 8,
                          padding: 6,
                          marginBottom: 8,
                        }}>
                          <Text style={{ fontSize: 18 }}>{macro.icon}</Text>
                        </View>
                        <Text style={{
                          fontSize: 22,
                          fontWeight: '800',
                          color: macro.color,
                        }}>
                          {macro.value}
                          <Text style={{ fontSize: 13, fontWeight: '500', color: darkMode ? '#aaa' : '#888' }}> {macro.unit}</Text>
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: darkMode ? '#888' : '#999',
                          marginTop: 2,
                          fontWeight: '500',
                        }}>
                          {macro.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            <Text style={[styles.grupoTitulo, darkMode && { color: '#fff' }]}>Elegir imagen</Text>

            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <TouchableOpacity onPress={() => imgMenuRef.current?.abrirMenu()} style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>

                {selectedUri && (
                  <Image
                    source={getImageSource(selectedUri)}
                    style={{
                      width: '70%',
                      height: 130,
                      borderRadius: 12,
                    }}
                  />
                )}

              </TouchableOpacity>
            </View>

            {renderSaveChangesButton(canEdit)}

          </View>
        </ScrollView >

        {renderIngredientsModal()}

        {/*menu buscar platos*/}
        <SearchMenu
          ref={searchMenuRef}
          data={allAvailableDishes}
          data2={myDishes}
          dataButton="Todos los platos"
          dataButton2="Mis platos"
          viewButtons={true}
          title="Agregar plato a la dieta"
          searchFields={["name"]}
          renderCustomItem={renderDishItemMenu}
          onSelectItem={handleAddDish}
          searchPlaceholder="Buscar plato..."
          height={height}
          numColumns={1}
        />

        {/*menu buscar imagenes*/}
        <SearchMenu
          ref={imgMenuRef}
          data={images}
          title="Seleccionar imagen"
          searchFields={["name"]}
          renderCustomItem={renderImageItemMenu}
          onSelectItem={(item) => handleSetImage(item.url)}
          searchPlaceholder="Buscar imagen..."
          height={height}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between'
          }}
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingBottom: 20
          }}
        />

      </View>
      <AppModal
        visible={appModal.visible}
        type={appModal.type}
        title={appModal.title}
        message={appModal.message}
        confirmText="Entendido"
        onConfirm={hideAppModal}
        darkMode={darkMode}
      />
    </>

  );
}

