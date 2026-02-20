import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, Image, ImageBackground, Animated, Dimensions, FlatList, Alert, ToastAndroid, Platform, StatusBar
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import { SearchMenu } from '../src/components/SearchMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alimentacion from './Alimentacion';
import Header from '../src/components/Header';
import style from './stylesheet';
import colors from './colors';
import Ingredient from '../src/objects/Ingredient';
import RenderLabels from '../src/components/RenderLabels.js';
import { LabelTextInput } from '../src/components/LabelTextInput';


export default function AddDietMenu({ route }) {

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

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

  ];

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

  {/*Rehydrate route.params.diet into a Diet instance so instance methods work*/ }
  const diet = useMemo(() => Diet.from(route?.params?.diet), [route?.params?.diet]);

  {/* If getName is null it means that we are creating a recipe*/ }
  let creatingRecipe = false;
  if (diet.getName() == null) creatingRecipe = true;

  {/*array de todos los platos*/ }
  const allAvailableDishes = [dish1, dish2, dish3, dish4, dish5, dish6];
  const myDishes = [dish1, dish3];

  {/*datos de la dieta*/ }
  {/*selectedDay: 0 = Lunes, 1 = Martes, ... 6 = Domingo*/ }
  const [selectedDay, setSelectedDay] = useState(0);
  const [dishes, setDishes] = useState(diet.getDishesForDay(0));
  const [dietName, setDietName] = useState('');
  const [dietDescription, setDietDescription] = useState('');
  const [selectedUri, setSelectedUri] = useState(route?.params?.diet?.imgUrl || images[0].url || null);
  const [darkMode, setDarkMode] = useState(false);

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
  const totalCarbs = (dishes.reduce((sum, p) => sum + (p?.carbohydrates || 0), 0));
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
      <View style={[styles.dishContainer, darkMode && { backgroundColor: '#1e1e1e', borderColor: '#000' }]}>
        <Image
          style={[styles.dishImage, { width: 80, height: 80, borderRadius: 8 }]}
          source={typeof item.imgUrl === 'number' ? item.imgUrl : { uri: item.imgUrl }}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={[styles.dishTitle, { fontSize: 14 }, darkMode && { color: '#fff' }]}>{item.name}</Text>
          <Text style={[styles.dishText, darkMode && { color: '#aaa' }]}>{item.getTotalCalories()} kcal</Text>
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
  }

  {/*-------FUNCIONES DE LOS PLATOS--------*/ }
  {/*funcion para agregar un plato a la dieta*/ }
  const handleAddDish = (selectedDish) => {

    {/*evitar añadir el mismo plato varias veces al día*/ }
    const dayDishes = diet.getDishesForDay(selectedDay);
    if (dayDishes.some(d => d.id === selectedDish.id)) {
      ToastAndroid.show('Este plato ya está en el día seleccionado.', ToastAndroid.SHORT);
      return;
    };

    {/*Añade el plato al día seleccionado dentro de newDiet*/ }
    diet.addDishToDay(selectedDay, selectedDish);
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
      <TouchableOpacity key={dish.id} onPress={() => showModal(dish.getIngredientsWithGrams())} onLongPress={() => handleDeleteDish(index)}>
        <View style={[styles.dishContainer, darkMode && { backgroundColor: '#1e1e1e', borderColor: '#000' }]}>
          <Image
            style={styles.dishImage}
            source={typeof dish.imgUrl === 'number' ? dish.imgUrl : { uri: dish.imgUrl }}
          />
          <View style={{ margin: 5, flex: 1 }}>
            <Text style={[styles.dishTitle, darkMode && { color: '#fff' }]}>{dish.name}</Text>
            <Text style={[styles.dishSubtitle, darkMode && { color: '#aaa' }]}>Calorías</Text>
            <Text style={[styles.dishText, darkMode && { color: '#fff' }]}>{calculateDishTotals(dish).totalCalories} kcal</Text>

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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, darkMode && { backgroundColor: '#1e1e1e' }]}>
          <ScrollView>
            <Text style={[styles.grupoTitulo, darkMode && { color: '#fff' }]}>Ingredientes</Text>

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
        <Text style={[styles.title_2, darkMode && { color: '#fff' }]}>{grams}g de {ingredient.name}</Text>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Calorías</Text>
          <Text style={[styles.text, darkMode && { color: '#fff' }]}>{(ingredient.calories * grams) / 100} kcal</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Fibra</Text>
          <Text style={[styles.text, darkMode && { color: '#fff' }]}>{(ingredient.fiber * grams) / 100} g</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Carbohidratos</Text>
          <Text style={[styles.text, darkMode && { color: '#fff' }]}>{(ingredient.carbohydrates * grams) / 100} g</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Grasas</Text>
          <Text style={[styles.text, darkMode && { color: '#fff' }]}>{(ingredient.fat * grams) / 100} g</Text>
        </View>

        <View style={styles.totalsContainer}>
          <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Proteína</Text>
          <Text style={[styles.text, darkMode && { color: '#fff' }]}>{(ingredient.protein * grams) / 100} g</Text>
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

    dish.getIngredientsWithGrams().forEach(({ ingredient, grams }) => {
      if (!ingredient) return;
      totalCalories += ((ingredient.calories || 0) * (grams || 0)) / 100;
      totalFiber += ((ingredient.fiber || 0) * (grams || 0)) / 100;
      totalCarbs += ((ingredient.carbohydrates || 0) * (grams || 0)) / 100;
      totalFat += ((ingredient.fat || 0) * (grams || 0)) / 100;
      totalProtein += ((ingredient.protein || 0) * (grams || 0)) / 100;
    });

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

    diet.getDishesForDay(selectedDay).forEach((dish) => {
      dish.getIngredientsWithGrams().forEach(({ ingredient, grams }) => {
        if (!ingredient) return;

        totalCalories += (ingredient.calories * grams) / 100;
        totalFiber += (ingredient.fiber * grams) / 100;
        totalCarbs += (ingredient.carbohydrates * grams) / 100;
        totalFat += (ingredient.fat * grams) / 100;
        totalProtein += (ingredient.protein * grams) / 100;
      });
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

    diet.getAllDishes().forEach((dayDishes) => {
      (dayDishes || []).forEach((dish) => {
        dish.getIngredientsWithGrams().forEach(({ ingredient, grams }) => {
          if (!ingredient) return;

          totalCalories += (ingredient.calories * grams) / 100;
          totalFiber += (ingredient.fiber * grams) / 100;
          totalCarbs += (ingredient.carbohydrates * grams) / 100;
          totalFat += (ingredient.fat * grams) / 100;
          totalProtein += (ingredient.protein * grams) / 100;
        });
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
    let roundedNum = Math.round(num * 100) / 100
    return roundedNum.toFixed(2);
  }

  const saveDiet = async () => {
    try {
      diet.id = Date.now();
      diet.name = dietName || `Dieta ${new Date().toLocaleDateString()}`;
      diet.description = dietDescription || '';
      diet.imgUrl = selectedUri;

      const dietToSave = {
        id: diet.id,
        name: diet.name,
        description: diet.description,
        imgUrl: diet.imgUrl,
        weeklyDishes: diet.weeklyDishes
      };

      addingGroup.push(dietToSave);

      setDietName('');
      setDietDescription('');
      setAllDishes([...diet.getAllDishes()]);

      Alert.alert('Guardado', 'La dieta se ha guardado correctamente.');
    } catch (err) {
      console.error('Error saving diet:', err);
      Alert.alert('Error', 'No se pudo guardar la dieta.');
    }
  };

  {/*botones y otros elementos*/ }
  const renderNameInput = (creatingRecipe) => {
    if (creatingRecipe) {
      return (
        <View style={{ marginVertical: 15 }}>
          <LabelTextInput
            style={[styles.input, darkMode && { backgroundColor: '#1e1e1e', borderColor: '#000', color: '#fff' }]}
            label="Nombre de la dieta"
            placeholder="Nombre..."
            value={dietName}
            onChangeText={setDietName}
            darkMode={darkMode}
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
          style={[styles.addDishButton, darkMode && { borderColor: '#000' }]}
          onPress={() => searchMenuRef.current?.abrirMenu()}
        >
          <Text style={[darkMode && { color: '#fff' }]}>+ Añadir plato</Text>
        </TouchableOpacity>
      )
    }
    return null;
  };

  const renderSaveChangesButton = (creatingRecipe) => {
    if (creatingRecipe) {
      return (
        <TouchableOpacity style={styles.button} onPress={saveDiet}><Text style={styles.buttonText}>{creatingRecipe ? "Guardar Dieta" : "Guardar Cambios"}</Text></TouchableOpacity>

      )
    }
  }


  return (
    <View style={[styles.container, darkMode && { backgroundColor: '#000', marginTop: 0, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <ExpoStatusBar style={darkMode ? "light" : "auto"} backgroundColor={darkMode ? "#000" : "transparent"} translucent={true} />

      <Header title={screenTitle} showBackButton={true} darkMode={darkMode} />



      <ScrollView contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: '#000' }]} showsVerticalScrollIndicator={false}>
        <View style={styles.grupoContainer}>

          {renderNameInput(creatingRecipe)}

          <View style={styles.daysContainer}>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 0 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(0); setDishes(diet.getDishesForDay(0)); setBttId(0); }}><Text style={[darkMode && { color: '#fff' }]}>L</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 1 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(1); setDishes(diet.getDishesForDay(1)); setBttId(1) }}><Text style={[darkMode && { color: '#fff' }]}>M</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 2 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(2); setDishes(diet.getDishesForDay(2), setBttId(2)); }}><Text style={[darkMode && { color: '#fff' }]}>X</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 3 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(3); setDishes(diet.getDishesForDay(3), setBttId(3)); }}><Text style={[darkMode && { color: '#fff' }]}>J</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 4 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(4); setDishes(diet.getDishesForDay(4), setBttId(4)); }}><Text style={[darkMode && { color: '#fff' }]}>V</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 5 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(5); setDishes(diet.getDishesForDay(5), setBttId(5)); }}><Text style={[darkMode && { color: '#fff' }]}>S</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, darkMode && { elevation: 0, shadowOpacity: 0 }, { backgroundColor: 6 === bttId ? (darkMode ? '#333' : colors.light_gray) : (darkMode ? '#000' : colors.white) }]} onPress={() => { setSelectedDay(6); setDishes(diet.getDishesForDay(6), setBttId(6)); }}><Text style={[darkMode && { color: '#fff' }]}>D</Text></TouchableOpacity>
          </View>

          {renderAddDishButton(creatingRecipe)}

          {/*renderizar todos los dishes que haya en el día seleccionado*/}
          {renderDishList()}

          <Text style={[styles.grupoTitulo, darkMode && { color: '#fff' }]}>Totales</Text>

          {/*DIARIO*/}
          <Text style={[styles.title_2, darkMode && { color: '#fff' }]}>Diario</Text>
          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Calorías</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateDailyTotals(selectedDay).totalCalories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Fibra</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateDailyTotals(selectedDay).totalFiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Carbohidratos</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateDailyTotals(selectedDay).totalCarbs} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Grasas</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateDailyTotals(selectedDay).totalFat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Proteína</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateDailyTotals(selectedDay).totalProtein} g</Text>
          </View>

          {/*SEMANAL*/}
          <Text style={[styles.title_2, darkMode && { color: '#fff' }]}>Semanal</Text>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Calorías</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateWeeklyTotals().totalCalories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Fibra</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateWeeklyTotals().totalFiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Carbohidratos</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateWeeklyTotals().totalCarbs} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Grasas</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateWeeklyTotals().totalFat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Proteína</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateWeeklyTotals().totalProtein} g</Text>
          </View>

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

          {renderSaveChangesButton(creatingRecipe)}

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

  );
}
