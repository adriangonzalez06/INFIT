import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, Image, ImageBackground, Animated, Dimensions, FlatList, Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import { useRoute } from '@react-navigation/native';
import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import { SearchMenu } from '../src/components/SearchMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alimentacion from './Alimentacion';
import { getAllMeals } from '../src/services/MealsService';

import style from './stylesheet';
import colors from './colors';

export default function AddDietMenu({ route }) {

  {/*route: group, diet*/ }

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

  {/*array de dietas al que añadir la dieta*/ }
  // Asegurarse de que addingGroup sea siempre un array (maneja route.params undefined/null y valores no array)
  const addingGroup = Array.isArray(route?.params?.recipes) ? route.params.recipes : [];


  // Rehydrate route.params.diet into a Diet instance so instance methods work
  const diet = useMemo(() => Diet.from(route?.params?.diet), [route?.params?.diet]);
  console.log('diet:', diet.getName ? diet.getName() : diet);

  {/* If getName is null it means that we are creating a recipe*/ }
  let creatingRecipe = false;
  if (diet.getName() == null) creatingRecipe = true;

  {/*array de todos los platos desde Firestore*/ }
  const [allAvailableDishes, setAllAvailableDishes] = useState([]);

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
          setAllAvailableDishes(dishesFromDB);
          console.log('✅ Platos cargados en AddDietMenu:', dishesFromDB.length);
        } else {
          // Si no hay platos de Firestore, usar fallback
          const fallbackDishes = [
            new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false),
            new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
            new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
            new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
            new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false),
            new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
          ];
          setAllAvailableDishes(fallbackDishes);
          console.log('⚠️  Usando platos de fallback');
        }
      } catch (error) {
        console.error('❌ Error cargando platos:', error);
        // Fallback en caso de error
        const fallbackDishes = [
          new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false),
          new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
          new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, false, false, false),
        ];
        setAllAvailableDishes(fallbackDishes);
      }
    };

    loadMeals();
  }, []);

  {/*datos de la dieta*/ }
  // selectedDay: 0 = Lunes, 1 = Martes, ... 6 = Domingo
  const [selectedDay, setSelectedDay] = useState(0);
  const [dishes, setDishes] = useState(diet.getDishesForDay(0));
  const [dietName, setDietName] = useState('');
  const [dietDescription, setDietDescription] = useState('');
  {/*all dishes of all days*/ }
  const [allDishes, setAllDishes] = useState(diet.getAllDishes());

  {/*Totales de la diet*/ }
  const totalCalories = (dishes.reduce((sum, p) => sum + (p?.calories || 0), 0));
  const totalMacronutrients = (dishes.reduce((sum, p) => sum + (p?.macronutrients || 0), 0));

  {/*modal ingredients*/ }
  const [visible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  {/*button color*/ }
  const [bttId, setBttId] = useState(0);


  {/*-------CONSTANTES MENU DESPLEGABLE--------*/ }
  {/*SearchMenu ref para abrirlo desde el boton*/ }
  const searchMenuRef = useRef(null);

  {/*funcion para agregar un plato a la dieta*/ }
  const handleAddDish = (selectedDish) => {
    // Añade el plato al día seleccionado dentro de newDiet
    diet.addDishToDay(selectedDay, selectedDish);
    // Actualiza el estado local para re-renderizar la lista del día
    setDishes([...diet.getDishesForDay(selectedDay)]);
    setAllDishes([...diet.getAllDishes()]);
  };

  {/*componente personalizado para renderizar items en el SearchMenu*/ }
  const renderDishItemMenu = ({ item }) => (
    <TouchableOpacity onPress={() => { handleAddDish(item); searchMenuRef.current?.cerrarMenu?.(); }}>
      <View style={[styles.dishContainer, { marginHorizontal: 10, marginVertical: 8 }]}>
        <Image
          style={[styles.dishImage, { width: 80, height: 80, borderRadius: 8 }]}
          source={typeof item.imgUrl === 'number' ? item.imgUrl : { uri: item.imgUrl }}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={[styles.dishTitle, { fontSize: 14 }]}>{item.name}</Text>
          <Text style={styles.dishText}>{item.calories} kcal</Text>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 3 }}>
            {item.vegetarian && <Text style={[style.label, style.labelVegetarian]}>Vegetariano</Text>}
            {item.vegan && <Text style={[style.label, style.labelVegan]}>Vegano</Text>}
            {item.gluten_free && <Text style={[style.label, style.labelGlutenFree]}>Sin Gluten</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  {/*funciones para mostrar/ocultar modal ingredients*/ }
  const showModal = (ingredients) => {
    setSelectedIngredients(ingredients ?? []);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedIngredients([]);
  };

  {/*funcion para renderizar cada dish de la diet*/ }
  const renderPlato = (dish, index) => {
    return (
      <TouchableOpacity key={dish.id} onPress={() => showModal(dish.ingredients)} onLongPress={() => handleDeleteDish(index)}>
        <View style={styles.dishContainer}>
          <Image
            style={styles.dishImage}
            source={typeof dish.imgUrl === 'number' ? dish.imgUrl : { uri: dish.imgUrl }}
          />
          <View style={{ margin: 5, flex: 1 }}>
            <Text style={styles.dishTitle}>{dish.name}</Text>

            <Text style={styles.dishSubtitle}>Calorías</Text>
            <Text style={styles.dishText}>{dish.calories} kcal</Text>


            {renderCharacteristics(dish).length > 0 && (
              <Text style={styles.dishText}>{renderCharacteristics(dish)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  {/*funcion para renderizar las caracteristicas de cada dish*/ }
  const renderCharacteristics = (dish) => {
    const list = [];
    if (dish.vegan) list.push('Vegano');
    if (dish.vegetarian) list.push('Vegetariano');
    if (dish.gluten_free) list.push('Sin Gluten');
    return list.length ? list.join(', ') : '';
  };

  {/*funcion para calcular los totales semanales*/ }
  const calculateWeeklyTotals = () => {
    let totalCalories = 0;
    let totalMacronutrients = 0;
    diet.getAllDishes().forEach((dayDishes) => {
      (dayDishes || []).forEach((dish) => {
        totalCalories += (dish?.calories || 0);
        totalMacronutrients += (dish?.macronutrients || 0);
      });
    });

    return { totalCalories, totalMacronutrients };
  };

  {/*funcion para renderizar la list de dishes*/ }
  const renderDishList = () => {
    return (dishes || []).map((dish, idx) => renderPlato(dish, idx));
  };

  const handleDeleteDish = (index) => {
    // borra por índice del día seleccionado
    diet.weeklyDishes[selectedDay].splice(index, 1);
    setDishes([...diet.getDishesForDay(selectedDay)]);
    setAllDishes([...diet.getAllDishes()]);
  };

  const renderIngredientsModal = () => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ingredientes</Text>
          <Text style={styles.dishText}>{selectedIngredients.length ? selectedIngredients.join(', ') : 'No hay ingredients'}</Text>


          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={hideModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Guarda la dieta en la API backend
  const saveDiet = async () => {
    try {
      // Obtener userId del AsyncStorage
      const userDocId = await AsyncStorage.getItem("userDocId");
      
      if (!userDocId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario. Por favor inicia sesión nuevamente.');
        return;
      }

      // Validar que tenga nombre
      if (!dietName || dietName.trim() === '') {
        Alert.alert('Error', 'Por favor ingresa un nombre para la dieta');
        return;
      }

      // Actualizar propiedades de diet
      diet.id = Date.now();
      diet.name = dietName.trim();
      diet.description = dietDescription?.trim() || '';

      // Convertir weeklyDishes a formato compatible con Firestore (objeto con claves numéricas)
      // Firestore NO permite arrays anidados, así que usamos un objeto
      const serializedWeeklyDishes = {};
      diet.weeklyDishes.forEach((dayDishes, dayIndex) => {
        serializedWeeklyDishes[dayIndex.toString()] = (dayDishes || []).map(dish => ({
          id: dish.id,
          name: dish.name,
          imgUrl: dish.imgUrl,
          calories: dish.calories,
          macronutrients: dish.macronutrients,
          ingredients: dish.ingredients || [],
          vegetarian: dish.vegetarian || false,
          vegan: dish.vegan || false,
          gluten_free: dish.gluten_free || false
        }));
      });

      // Preparar datos para enviar a la API
      const dietData = {
        name: diet.name,
        description: diet.description,
        userID: userDocId,
        weeklyDishes: serializedWeeklyDishes,
        imgUrl: 'https://via.placeholder.com/300x300?text=Dieta+Personalizada',
        type_diet: 'personalizada',
        number_meals: 5
      };

      // Usar 10.0.2.2 para emulador Android, localhost para otros
      const host = '10.0.2.2'; // Android emulator, cambiar a localhost en web o a IP en dispositivo real
      const port = '8082';
      const url = `http://${host}:${port}/api/infopersonalizeddiet`;

      console.log('📤 Enviando dieta a:', url);
      console.log('📦 Datos:', JSON.stringify(dietData));

      // Enviar POST a la API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dietData),
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
        ...dietData
      });

      setDietName('');
      setDietDescription('');
      setAllDishes([...diet.getAllDishes()]);

      Alert.alert('¡Éxito!', 'La dieta personalizada se ha guardado correctamente.');
      
      // Navegar de vuelta a Alimentacion
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error saving diet:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar la dieta. Verifica la conexión al servidor.');
    }
  };

  const renderNameInput = (creatingRecipe) => {
    if (creatingRecipe) {
      return (
        <View style={{ marginVertical: 8 }}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la dieta"
            value={dietName}
            onChangeText={setDietName}
          />
        </View>
      )
    }
    return null;
  };

  const renderAddDishButton = (creatingRecipe) => {
    if (creatingRecipe) {
      return (
        <TouchableOpacity
          style={styles.addDishButton}
          onPress={() => searchMenuRef.current?.abrirMenu()}
        >
          <Text>+ Añadir plato</Text>
        </TouchableOpacity>
      )
    }
    return null;
  };

  const renderSaveChangesButton = (creatingRecipe) => {
    if (creatingRecipe) {
      return (
        <TouchableOpacity style={styles.saveButton} onPress={saveDiet}><Text style={styles.button}>{creatingRecipe ? "Guardar Dieta" : "Guardar Cambios"}</Text></TouchableOpacity>

      )
    }
  }


  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title   Array.isArray(route?.params?.recipes) ? route.params.recipes : [];    */}
      <Text style={styles.title}>{diet.getName() || "Crear una dieta"}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grupoContainer}>

          {renderNameInput(creatingRecipe)}

        <View style={styles.daysContainer}>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(0); setDishes(diet.getDishesForDay(0)); }}><Text>LUN</Text></TouchableOpacity>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(1); setDishes(diet.getDishesForDay(1)); }}><Text>MAR</Text></TouchableOpacity>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(2); setDishes(diet.getDishesForDay(2)); }}><Text>MIE</Text></TouchableOpacity>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(3); setDishes(diet.getDishesForDay(3)); }}><Text>JUE</Text></TouchableOpacity>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(4); setDishes(diet.getDishesForDay(4)); }}><Text>VIE</Text></TouchableOpacity>
        </View>
        <View style={[styles.daysContainer, { justifyContent: 'center' }]}>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(5); setDishes(diet.getDishesForDay(5)); }}><Text>SAB</Text></TouchableOpacity>
          <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(6); setDishes(diet.getDishesForDay(6)); }}><Text>DOM</Text></TouchableOpacity>
        </View>

        {renderAddDishButton(creatingRecipe)}


        {/*renderizar todos los dishes que haya en el día seleccionado*/}
        {renderDishList()}

        <Text style={styles.grupoTitulo}>Totales</Text>

        <Text style={styles.title_2}>Diario</Text>
        <View style={styles.totalsContainer}>
          <Text style={styles.title_3}>Calorías</Text>
          <Text style={styles.text}>{totalCalories} kcal</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={styles.title_3}>Macronutrientes</Text>
          <Text style={styles.text}>{totalMacronutrients} g</Text>
        </View>

        <Text style={styles.title_2}>Semanal</Text>
        <View style={styles.totalsContainer}>
          <Text style={styles.title_3}>Calorías</Text>
          <Text style={styles.text}>{calculateWeeklyTotals().totalCalories} kcal</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={styles.title_3}>Macronutrientes</Text>
          <Text style={styles.text}>{calculateWeeklyTotals().totalMacronutrients} g</Text>
        </View>

        {renderSaveChangesButton(creatingRecipe)}

        </View>
      </ScrollView >

    { renderIngredientsModal() }

    < SearchMenu
  ref = { searchMenuRef }
  data = { allAvailableDishes }
  title = "Agregar plato a la dieta"
  searchFields = { ["name"]}
  renderCustomItem = { renderDishItemMenu }
  onSelectItem = { handleAddDish }
  searchPlaceholder = "Buscar plato..."
  height = { height }
    />

    </View >

  );
}

