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

import { getAllMeals, getUserMeals, getMealIngredients } from '../src/services/MealsService';
import AppModal from './AppModal';
import Header from '../src/components/Header';
import colors from './colors';
import Ingredient from '../src/objects/Ingredient';
import RenderLabels from '../src/components/RenderLabels.js';
import { BACKEND_URL } from '../src/config';

export default function AddDietMenu({ route }) {

  const navigation = useNavigation();
  const { width, height } = Dimensions.get('window');

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

  /* isCreating: si no se pasó diet, estamos creando */
  const isCreating = !route?.params?.diet;

  /* isPersonalized: viene de Alimentacion cuando se pulsa "Editar dieta" */
  const isPersonalized = route?.params?.isPersonalized ?? false;

  /* canEdit: habilitar edición si estamos creando o editando explícitamente */
  const canEdit = isCreating || isPersonalized;

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
        const validMeals = meals.filter(m => (m.calories || m.kcal || 0) > 0);
        const dishesFromDB = validMeals.map((meal, index) =>
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
            const validUserMeals = userMealsData.filter(m => (m.calories || m.kcal || 0) > 0);
            const userDishesFromDB = validUserMeals.map((meal, index) =>
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
        if (!isCreating && diet && diet.weeklyDishes) {
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
    }, [isCreating, diet])
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

  /* ---------- CRUD states para platos ---------- */
  const [dishCRUDVisible, setDishCRUDVisible] = useState(false);
  const [selectedDishIdx, setSelectedDishIdx] = useState(null);
  const [selectedDishObject, setSelectedDishObject] = useState(null);

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
  const [selectedDishForModal, setSelectedDishForModal] = useState(null);
  const [loadingIngredients, setLoadingIngredients] = useState(false);

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

    return (
      <TouchableOpacity
        key={dish.id + "-" + index}
        onPress={() => showModal(dish)}
        onLongPress={canEdit ? () => {
          setSelectedDishIdx(index);
          setSelectedDishObject(dish);
          setDishCRUDVisible(true);
        } : undefined}
      >
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
  const showModal = async (dish) => {
    try {
      setSelectedDishForModal(dish);
      setLoadingIngredients(true);
      setModalVisible(true);

      // Cargar ingredientes desde Firestore
      const ingredients = await getMealIngredients(dish.id);

      if (ingredients && ingredients.length > 0) {
        console.log(`✅ ${ingredients.length} ingredientes cargados para ${dish.name}`);
        setSelectedIngredients(ingredients);
      } else {
        // Si no hay ingredientes en Firestore, usar los que tiene el dish
        const dishIngredients = dish.getIngredientsWithGrams?.() || [];
        console.log(`⚠️ Usando ingredientes del dish (${dishIngredients.length})`);
        setSelectedIngredients(dishIngredients);
      }
    } catch (error) {
      console.error('❌ Error cargando ingredientes:', error);
      // Fallback a los ingredientes del dish
      setSelectedIngredients(dish.getIngredientsWithGrams?.() || []);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedIngredients([]);
    setSelectedDishForModal(null);
  };

  {/*renderizar lista de ingredientes dentro del modal*/ }
  const renderIngredientsModal = () => {
    // Calcular totales de macros para el ticket
    let ticketTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };

    if (Array.isArray(selectedIngredients)) {
      selectedIngredients.forEach(item => {
        let ingredient, grams;
        if (item.ingredient) {
          ingredient = item.ingredient;
          grams = item.grams || 100;
        } else {
          ingredient = item;
          grams = 100;
        }

        // Buscar valores con posibles nombres alternativos
        const cal = (ingredient.calories || ingredient.kcal || 0);
        const prot = (ingredient.protein || ingredient.proteins || ingredient.proteina || 0);
        const carb = (ingredient.carbohydrates || ingredient.carbs || ingredient.carbohidratos || 0);
        const fat = (ingredient.fat || ingredient.grasas || 0);
        const fib = (ingredient.fiber || ingredient.fibra || 0);

        ticketTotals.calories += (cal * grams) / 100;
        ticketTotals.protein += (prot * grams) / 100;
        ticketTotals.carbs += (carb * grams) / 100;
        ticketTotals.fat += (fat * grams) / 100;
        ticketTotals.fiber += (fib * grams) / 100;
      });
    }

    // Si el cálculo dio 0 pero el plato tiene macros, usamos los del plato como fallback
    if (ticketTotals.calories === 0 && selectedDishForModal) {
      console.log('⚠️ Usando fallback de macros del plato');
      ticketTotals.calories = Number(selectedDishForModal.calories) || 0;
      ticketTotals.protein = Number(selectedDishForModal.protein) || 0;
      ticketTotals.carbs = Number(selectedDishForModal.carbs || selectedDishForModal.carbohydrates) || 0;
      ticketTotals.fat = Number(selectedDishForModal.fat) || 0;
      ticketTotals.fiber = Number(selectedDishForModal.fiber) || 0;
    }

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Encabezado del Ticket */}
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptTitle}>Ticket de Plato</Text>
                <Text style={styles.receiptSubtitle}>#{Math.floor(Math.random() * 90000) + 10000}</Text>
                <Text style={styles.receiptSubtitle}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</Text>
              </View>

              <Text style={[styles.receiptItemText, { fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }]}>
                {selectedDishForModal?.name || 'PLATO SIN NOMBRE'}
              </Text>

              <View style={styles.receiptSeparator} />

              {loadingIngredients ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={styles.receiptItemText}>Cargando ingredientes...</Text>
                </View>
              ) : (
                <>
                  {Array.isArray(selectedIngredients) && selectedIngredients.length > 0 ? (
                    selectedIngredients.map((item, index) => renderIngredientObject(item, index))
                  ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={styles.receiptItemText}>No hay ingredientes</Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.receiptSeparator} />

              {/* Totales Nutricionales */}
              <View style={styles.receiptTotalContainer}>
                <Text style={styles.receiptTotalLabel}>TOTAL CALORÍAS</Text>
                <Text style={styles.receiptTotalValue}>{ticketTotals.calories.toFixed(0)} kcal</Text>
              </View>

              <View style={[styles.receiptItem, { marginTop: 5 }]}>
                <Text style={styles.receiptItemText}>PROTEÍNA TOTAL</Text>
                <Text style={styles.receiptItemValue}>{ticketTotals.protein.toFixed(1)}g</Text>
              </View>
              <View style={styles.receiptItem}>
                <Text style={styles.receiptItemText}>CARBOS TOTALES</Text>
                <Text style={styles.receiptItemValue}>{ticketTotals.carbs.toFixed(1)}g</Text>
              </View>
              <View style={styles.receiptItem}>
                <Text style={styles.receiptItemText}>GRASAS TOTALES</Text>
                <Text style={styles.receiptItemValue}>{ticketTotals.fat.toFixed(1)}g</Text>
              </View>
              <View style={styles.receiptItem}>
                <Text style={styles.receiptItemText}>FIBRA TOTAL</Text>
                <Text style={styles.receiptItemValue}>{ticketTotals.fiber.toFixed(1)}g</Text>
              </View>

              <View style={styles.receiptFooter}>
                <Text style={styles.receiptFooterText}>INFIT</Text>
              </View>

              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <TouchableOpacity onPress={hideModal} style={[styles.modalButton, { paddingHorizontal: 40 }]}>
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  {/*renderizar objeto ingrediente para poner en la lista*/ }
  const renderIngredientObject = (item, index = 0) => {
    if (!item) return null;

    let ingredient, grams;
    if (item.ingredient) {
      ingredient = item.ingredient;
      grams = item.grams || 100;
    } else {
      ingredient = item;
      grams = 100;
    }

    if (!ingredient || !ingredient.name) return null;

    // Buscar valores con posibles nombres alternativos
    const cal = (ingredient.calories || ingredient.kcal || 0);
    const prot = (ingredient.protein || ingredient.proteins || ingredient.proteina || 0);
    const carb = (ingredient.carbohydrates || ingredient.carbs || ingredient.carbohidratos || 0);
    const fat = (ingredient.fat || ingredient.grasas || 0);
    const fib = (ingredient.fiber || ingredient.fibra || 0);

    const itemCalories = (cal * grams) / 100;
    const itemMacros = {
      p: (prot * grams) / 100,
      c: (carb * grams) / 100,
      f: (fat * grams) / 100,
      fb: (fib * grams) / 100,
    };

    return (
      <View key={`${ingredient.id}-${index}`} style={{ marginBottom: 12 }}>
        <View style={styles.receiptItem}>
          <Text style={[styles.receiptItemText, { fontWeight: 'bold' }]}>
            {grams}g {ingredient.name.toUpperCase()}
          </Text>
          <Text style={[styles.receiptItemValue, { fontWeight: 'bold' }]}>
            {itemCalories.toFixed(1)}
          </Text>
        </View>
        <View style={styles.receiptItem}>
          <Text style={[styles.receiptItemText, { fontSize: 11, color: '#666' }]}>
            P: {itemMacros.p.toFixed(1)}g | C: {itemMacros.c.toFixed(1)}g | G: {itemMacros.f.toFixed(1)}g | F: {itemMacros.fb.toFixed(1)}g
          </Text>
        </View>
      </View>
    );
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
        <View style={{ marginBottom: 25 }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 10,
            marginLeft: 4
          }}>Nombre de la Dieta</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: darkMode ? '#1e1e1e' : '#fff',
            borderRadius: 18,
            paddingHorizontal: 18,
            borderWidth: 1.5,
            borderColor: darkMode ? '#2a2a2a' : '#f0f0f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 3,
          }}>
            <Ionicons name="bookmark-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 16,
                fontSize: 16,
                color: darkMode ? '#fff' : '#111',
                fontWeight: '700',
              }}
              placeholder="Ej: Dieta de Definición 2024"
              placeholderTextColor={darkMode ? '#555' : '#ccc'}
              value={dietName}
              onChangeText={setDietName}
            />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderAddDishButton = (canEdit) => {
    if (canEdit) {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: darkMode ? '#1a1a1f' : '#f8f9fa',
            paddingVertical: 16,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: colors.primary + '33',
            borderStyle: 'dashed',
            marginBottom: 20,
            gap: 10
          }}
          onPress={() => searchMenuRef.current?.abrirMenu()}
        >
          <View style={{
            backgroundColor: colors.primary + '22',
            padding: 5,
            borderRadius: 10
          }}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </View>
          <Text style={{
            color: darkMode ? '#ffffff' : '#111114',
            fontWeight: '700',
            fontSize: 15,
            letterSpacing: 0.5
          }}>Añadir plato al día</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderSaveChangesButton = (canEdit) => {
    if (canEdit) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 18,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            marginBottom: 40,
            flexDirection: 'row',
            gap: 10,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 8,
          }}
          onPress={isPersonalized ? updateDiet : saveDiet}
        >
          <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
          <Text style={{
            color: '#fff',
            fontWeight: '800',
            fontSize: 17,
            letterSpacing: 0.5
          }}>
            {isPersonalized ? 'Guardar Cambios' : 'Finalizar Dieta'}
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

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 25,
              backgroundColor: darkMode ? '#1e1e1e' : '#fff',
              padding: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: darkMode ? '#2a2a2a' : '#f0f0f0',
            }}>
              {[
                { label: 'L', idx: 0 },
                { label: 'M', idx: 1 },
                { label: 'X', idx: 2 },
                { label: 'J', idx: 3 },
                { label: 'V', idx: 4 },
                { label: 'S', idx: 5 },
                { label: 'D', idx: 6 }
              ].map((day) => {
                const isSelected = day.idx === bttId;
                return (
                  <TouchableOpacity
                    key={day.idx}
                    activeOpacity={0.7}
                    style={{
                      width: (width - 80) / 7,
                      aspectRatio: 1,
                      borderRadius: 12,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: isSelected ? colors.primary : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: isSelected ? 4 : 0,
                    }}
                    onPress={() => {
                      setSelectedDay(day.idx);
                      setDishes(diet.getDishesForDay(day.idx));
                      setBttId(day.idx);
                    }}
                  >
                    <Text style={{
                      color: isSelected ? '#fff' : (darkMode ? '#888' : '#666'),
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: 14
                    }}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
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
                  {(() => {
                    const kcalNum = Number(data.totalCalories);
                    const mult = totalsTab === 'daily' ? 1 : 7;

                    let kcalColor = '#ef2b2d'; // Defecto Rojo
                    let kcalBg = darkMode ? '#331a1a' : '#fff0f0'; // Fondo por defecto

                    if (kcalNum < 1300 * mult) {
                      kcalColor = '#facc15'; // Amarillo (bajo)
                      kcalBg = darkMode ? '#2e2e1a' : '#fffdf0';
                    } else if (kcalNum <= 2000 * mult) {
                      kcalColor = '#4ade80'; // Verde
                      kcalBg = darkMode ? '#1a2e1a' : '#f0fff4';
                    } else if (kcalNum <= 3000 * mult) {
                      kcalColor = '#facc15'; // Amarillo
                      kcalBg = darkMode ? '#2e2e1a' : '#fffdf0';
                    }

                    return (
                      <View style={{
                        borderRadius: 18,
                        padding: 20,
                        marginBottom: 14,
                        alignItems: 'center',
                        backgroundColor: kcalBg,
                        borderWidth: 1.5,
                        borderColor: kcalColor + '44',
                      }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: kcalColor, marginBottom: 4, letterSpacing: 0.5 }}>
                          CALORÍAS TOTALES
                        </Text>
                        <Text style={{
                          fontSize: 44,
                          fontWeight: '800',
                          color: kcalColor,
                          letterSpacing: -1,
                        }}>
                          {data.totalCalories}
                        </Text>
                        <Text style={{ fontSize: 14, color: darkMode ? '#aaa' : '#888', fontWeight: '500' }}>kcal</Text>
                      </View>
                    );
                  })()}

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

            {canEdit && (
              <>
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
              </>
            )}

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
        onConfirm={hideAppModal}
      />

      {/* MODAL CRUD PLATO (Estilo Alimentacion) */}
      <Modal visible={dishCRUDVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setDishCRUDVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: darkMode ? '#1a1a1a' : '#fff',
              padding: 24,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              width: '100%',
              paddingBottom: 40,
            }}
          >
            {/* Indicador */}
            <View style={{ width: 40, height: 5, backgroundColor: darkMode ? '#444' : '#ccc', borderRadius: 3, alignSelf: 'center', marginBottom: 15 }} />

            <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 20, color: darkMode ? '#fff' : '#1a1a1a' }}>
              {selectedDishObject?.name || 'Opciones del plato'}
            </Text>

            {/* Eliminar */}
            <TouchableOpacity
              onPress={() => {
                handleDeleteDish(selectedDishIdx);
                setDishCRUDVisible(false);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: darkMode ? '#333' : '#eee', gap: 15 }}
            >
              <Ionicons name="trash-outline" size={22} color="#ef2b2d" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef2b2d' }}>Quitar plato de la dieta</Text>
            </TouchableOpacity>

            {/* Duplicar (Opcional, pero util) */}
            <TouchableOpacity
              onPress={() => {
                const dayDishes = diet.weeklyDishes[selectedDay];
                dayDishes.push(selectedDishObject);
                setDishes([...diet.getDishesForDay(selectedDay)]);
                setAllDishes([...diet.getAllDishes()]);
                setDishCRUDVisible(false);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 }}
            >
              <Ionicons name="copy-outline" size={22} color={darkMode ? '#ccc' : '#333'} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: darkMode ? '#ccc' : '#333' }}>Duplicar plato</Text>
            </TouchableOpacity>

            {/* Botón cerrar */}
            <TouchableOpacity
              onPress={() => setDishCRUDVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: darkMode ? '#333' : '#f5f5f5',
                paddingVertical: 15,
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontWeight: '700', color: darkMode ? '#ccc' : '#666' }}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>

  );
}

