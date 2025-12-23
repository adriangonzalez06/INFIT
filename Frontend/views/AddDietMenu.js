import React, { useState, useRef, useMemo } from 'react';
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

import style from './stylesheet';
import colors from './colors';
import Ingredient from '../src/objects/Ingredient';

export default function AddDietMenu({ route }) {

  {/*route: group, diet*/ }

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

  //id, name, imgUrl, calories, fiber, carbohydrates, fat, protein)
  let in1 = new Ingredient(1, "Manzana", "url", 30, 2, 12, 2, 3);
  let in2 = new Ingredient(1, "Carne", "url", 40, 4, 14, 3, 1);

  {/*platos placeholder, leer los datos de la base de datos*/ }
  let dish1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [{ingredient: in1, grams: 150}, {ingredient: in2, grams: 110}], true, true, false);
  let dish2 = new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), [{ingredient: in2, grams: 150}, {ingredient: in2, grams: 110}], false, false, true);
  let dish3 = new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), [{ingredient: in2, grams: 150}, {ingredient: in1, grams: 110}], true, false, false);
  let dish4 = new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), [{ingredient: in1, grams: 150}, {ingredient: in2, grams: 110}], false, false, true);
  let dish5 = new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), [{ingredient: in1, grams: 150}, {ingredient: in2, grams: 110}], true, true, false);
  let dish6 = new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), [{ingredient: in1, grams: 150}, {ingredient: in2, grams: 110}], false, true, false);


  //console.log("test get name: ", dish1.getName());

  {/*array de dietas al que añadir la dieta*/ }
  // Asegurarse de que addingGroup sea siempre un array (maneja route.params undefined/null y valores no array)
  const addingGroup = Array.isArray(route?.params?.recipes) ? route.params.recipes : [];


  // Rehydrate route.params.diet into a Diet instance so instance methods work
  const diet = useMemo(() => Diet.from(route?.params?.diet), [route?.params?.diet]);
  console.log('diet:', diet.getName ? diet.getName() : diet);

  {/* If getName is null it means that we are creating a recipe*/ }
  let creatingRecipe = false;
  if (diet.getName() == null) creatingRecipe = true;

  {/*array de todos los platos*/ }
  const allAvailableDishes = [dish1, dish2, dish3, dish4, dish5, dish6];

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
  const totalFiber = (dishes.reduce((sum, p) => sum + (p?.fiber || 0), 0));
  const totalCarbs = (dishes.reduce((sum, p) => sum + (p?.carbohydrates || 0), 0));
  const totalFat = (dishes.reduce((sum, p) => sum + (p?.fat || 0), 0));
  const totalProtein = (dishes.reduce((sum, p) => sum + (p?.protein || 0), 0));

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

      console.log("ingredients de dish:" , dish.ingredients);
      console.log("ingredientesseleccionados2: ", selectedIngredients);

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
            <Text style={styles.dishText}>{calculateDishTotals(dish).totalCalories} kcal</Text>


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

  {/*calcular totales de cada plato para renderizar en su card y en el menu ingredientes*/ }
  const calculateDishTotals = (dish) => {
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    dish.getAllIngredients().forEach((ingredient) => {
      console.log("ingredient calories: ", ingredient.name, ingredient.calories);
      totalCalories += (ingredient?.calories || 0);
      totalFiber += (ingredient?.fiber || 0);
      totalCarbs += (ingredient?.carbohydrates || 0);
      totalFat += (ingredient?.fat || 0);
      totalProtein += (ingredient?.protein || 0);

    });

    return { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein, }


  };

  {/*funcion para calcular los totales diarios*/ }
  const calculateDailyTotals = (selectedDay) => {
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    diet.getDishesForDay(selectedDay).forEach((dish) => {
        dish.getAllIngredients().forEach((ingredient) => {
          totalCalories += (ingredient?.calories || 0);
          totalFiber += (ingredient?.fiber || 0);
          totalCarbs += (ingredient?.carbohydrates || 0);
          totalFat += (ingredient?.fat || 0);
          totalProtein += (ingredient?.protein || 0);
        });
    });

    return { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein, }

  };

  {/*funcion para calcular los totales semanales*/ }
  const calculateWeeklyTotals = () => {
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;
    console.log(diet.getAllDishes());

    diet.getAllDishes().forEach((dayDishes) => {
      (dayDishes || []).forEach((dish) => {
        dish.getAllIngredients().forEach((ingredient) => {
          totalCalories += (ingredient?.calories || 0);
          totalFiber += (ingredient?.fiber || 0);
          totalCarbs += (ingredient?.carbohydrates || 0);
          totalFat += (ingredient?.fat || 0);
          totalProtein += (ingredient?.protein || 0);
        })

      });
    });

    return { totalCalories, totalFiber, totalCarbs, totalFat, totalProtein, }

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
          <ScrollView>
          <Text style={styles.grupoTitulo}>Ingredientes</Text>


          {selectedIngredients.map((item) => (
            renderIngredientObject(item)
          ))}


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

  //Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [{ingredient: in1, grams: 150}, {ingredient: in2, grams: 110}], true, true, false);
  const renderIngredientObject = (item) => (

    <View key={item.ingredient.id}>
      <Text style={styles.title_2}>{item.grams}g de {item.ingredient.name}</Text>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Calorías</Text>
            <Text style={styles.text}>{item.calories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Fibra</Text>
            <Text style={styles.text}>{item.fiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Carbohidratos</Text>
            <Text style={styles.text}>{item.carbohydrates} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Grasas</Text>
            <Text style={styles.text}>{item.fat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Proteína</Text>
            <Text style={styles.text}>{item.protein} g</Text>
          </View>

    </View>
  )

  // Guarda la dieta  (para probar)
  const saveDiet = async () => {
    try {
      // Actualizar propiedades de diet
      diet.id = Date.now();
      diet.name = dietName || `Dieta ${new Date().toLocaleDateString()}`;
      diet.description = dietDescription || '';

      // Serializar diet (convertir a objeto plano)
      const dietToSave = {
        id: diet.id,
        name: diet.name,
        description: diet.description,
        imgUrl: require('../assets/images/images_dish/dish_02.jpg'),
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

      <View style={styles.header}>
        {/* go back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        {/* title   Array.isArray(route?.params?.recipes) ? route.params.recipes : [];    */}
        <Text style={styles.title}>{diet.getName() || "Crear una dieta"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grupoContainer}>

          {renderNameInput(creatingRecipe)}

          <View style={styles.daysContainer}>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 0 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(0); setDishes(diet.getDishesForDay(0)); setBttId(0); }}><Text>LUN</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 1 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(1); setDishes(diet.getDishesForDay(1)); setBttId(1) }}><Text>MAR</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 2 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(2); setDishes(diet.getDishesForDay(2), setBttId(2)); }}><Text>MIE</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 3 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(3); setDishes(diet.getDishesForDay(3), setBttId(3)); }}><Text>JUE</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 4 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(4); setDishes(diet.getDishesForDay(4), setBttId(4)); }}><Text>VIE</Text></TouchableOpacity>
          </View>
          <View style={[styles.daysContainer, { justifyContent: 'center' }]}>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 5 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(5); setDishes(diet.getDishesForDay(5), setBttId(5)); }}><Text>SAB</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.dayButton, { backgroundColor: 6 === bttId ? colors.light_gray : colors.white }]} onPress={() => { setSelectedDay(6); setDishes(diet.getDishesForDay(6), setBttId(6)); }}><Text>DOM</Text></TouchableOpacity>
          </View>

          {renderAddDishButton(creatingRecipe)}


          {/*renderizar todos los dishes que haya en el día seleccionado*/}
          {renderDishList()}

          <Text style={styles.grupoTitulo}>Totales</Text>

          <Text style={styles.title_2}>Diario</Text>
          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Calorías</Text>
            <Text style={styles.text}>{calculateDailyTotals(selectedDay).totalCalories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Fibra</Text>
            <Text style={styles.text}>{calculateDailyTotals(selectedDay).totalFiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Carbohidratos</Text>
            <Text style={styles.text}>{calculateDailyTotals(selectedDay).totalCarbs} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Grasas</Text>
            <Text style={styles.text}>{calculateDailyTotals(selectedDay).totalFat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Proteína</Text>
            <Text style={styles.text}>{calculateDailyTotals(selectedDay).totalProtein} g</Text>
          </View>

          <Text style={styles.title_2}>Semanal</Text>
          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Calorías</Text>
            <Text style={styles.text}>{calculateWeeklyTotals().totalCalories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Fibra</Text>
            <Text style={styles.text}>{calculateWeeklyTotals().totalFiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Carbohidratos</Text>
            <Text style={styles.text}>{calculateWeeklyTotals().totalCarbs} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Grasas</Text>
            <Text style={styles.text}>{calculateWeeklyTotals().totalFat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Proteína</Text>
            <Text style={styles.text}>{calculateWeeklyTotals().totalProtein} g</Text>
          </View>

          {renderSaveChangesButton(creatingRecipe)}

        </View>
      </ScrollView >

      {renderIngredientsModal()}

      < SearchMenu
        ref={searchMenuRef}
        data={allAvailableDishes}
        title="Agregar plato a la dieta"
        searchFields={["name"]}
        renderCustomItem={renderDishItemMenu}
        onSelectItem={handleAddDish}
        searchPlaceholder="Buscar plato..."
        height={height}
      />

    </View >

  );
}

