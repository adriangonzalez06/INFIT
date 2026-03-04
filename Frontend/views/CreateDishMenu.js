import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, Image, ImageBackground, Animated, Dimensions, FlatList
} from 'react-native';
import AppModal from './AppModal';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import Ingredient from '../src/objects/Ingredient';

import style from './stylesheet';
import colors from './colors';
import { LabelTextInput } from '../src/components/LabelTextInput';
import { SearchMenu } from '../src/components/SearchMenu';
import Header from '../src/components/Header';
import { getAllIngredients } from '../src/services/IngredientsService';
import { saveMeal } from '../src/services/MealsService';


export default function CreateDishMenu({ route }) {

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

  const imgMenuRef = useRef(null);
  const searchMenuRef = useRef(null);

  // Estado para almacenar todos los ingredientes cargados desde la BD
  const [allAvailableIngredients, setAllAvailableIngredients] = useState([]);

  {/*cargar ingredientes desde la base de datos al montar el componente*/ }
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        console.log('🔄 Iniciando carga de ingredientes...');
        const ingredients = await getAllIngredients();
        console.log('📦 Respuesta de getAllIngredients:', ingredients);
        console.log('📊 Tipo de respuesta:', typeof ingredients, 'Es array:', Array.isArray(ingredients));

        if (ingredients && ingredients.length > 0) {
          console.log('✅ Ingredientes cargados en CreateDishMenu:', ingredients.length);
          console.log('🔍 Primer ingrediente:', ingredients[0]);
          setAllAvailableIngredients(ingredients);
        } else {
          console.warn('⚠️ No se obtuvieron ingredientes de la base de datos');
          console.warn('Valor de ingredients:', ingredients);
          setAllAvailableIngredients([]);
        }
      } catch (error) {
        console.error('❌ Error cargando ingredientes:', error);
        console.error('Stack:', error.stack);
        setAllAvailableIngredients([]);
      }
    };

    loadIngredients();
  }, []);

  //imagenes para la dieta
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

  {/*array de platos al que añadir el plato (mis platos)*/ }
  // Asegurarse de que addingGroup sea siempre un array (maneja route.params undefined/null y valores no array)
  const addingGroup = Array.isArray(route?.params?.dish) ? route.params.dish : [];

  {/* If its null it means that we are creating a dish*/ }
  let creatingDish = false;
  if (!dish) creatingDish = true;

  // Rehydrate route.params.dish into a Dish instance so instance methods work
  const dish = useMemo(() => Dish.from(route?.params?.dish) || new Dish(null, '', '', [], false, false, false), [route?.params?.dish]);

  {/*gestion de imagenes locales y remotas*/ }
  {/*comprobar de donde vienen*/ }
  const getImageSource = (imgUrl) => {
    if (!imgUrl) return null;

    return typeof imgUrl === 'number'
      ? imgUrl
      : { uri: imgUrl };
  };

  const handleSetImage = (url) => {
    setSelectedUri(url);
    dish.setUrl(url);
  }

  {/* setters */ }
  const [ingredient, setIngredient] = useState();
  const [name, setName] = useState();
  const [grams, setGrams] = useState();
  const [visible, setModalVisible] = useState(false);
  const [selectedUri, setSelectedUri] = useState(route?.params?.dish?.imgUrl || images[0].url || null);
  const [ingredientsWithGrams, setIngredientsWithGrams] = useState(dish?.getIngredientsWithGrams() || []);
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null);
  const [selectedIngredientWithGrams, setSelectedIngredientWithGrams] = useState(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [allDishes, setAllDishes] = useState([]);

  // Estados para el modal de añadir ingrediente con gramos
  const [showAddIngredientGramsModal, setShowAddIngredientGramsModal] = useState(false);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);
  const [tempGrams, setTempGrams] = useState('100');
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

  {/*funcion para calcular los totales diarios*/ }
  const calculateTotals = (dish) => {
    if (!dish) return { totalCalories: 0, totalFiber: 0, totalCarbs: 0, totalFat: 0, totalProtein: 0 };
    let totalCalories = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;

    dish.getIngredientsWithGrams().forEach(({ ingredient, grams }) => {
      if (!ingredient) return;

      totalCalories += (ingredient.calories * grams) / 100;
      totalFiber += (ingredient.fiber * grams) / 100;
      totalCarbs += (ingredient.carbohydrates * grams) / 100;
      totalFat += (ingredient.fat * grams) / 100;
      totalProtein += (ingredient.protein * grams) / 100;
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

  {/*-------FUNCIONES DE MENU DESPLEGABLE--------*/ }
  {/*componente personalizado para renderizar items en el SearchMenu*/ }
  const renderIngredientItemMenu = ({ item }) => (
    <TouchableOpacity onPress={() => { handleAddIngredient(item); }}>
      {renderIngredientBody({ item })}
    </TouchableOpacity>
  );


  {/*renderizar cuerpo del ingrediente*/ }
  const renderIngredientBody = ({ item }) => {

    return (

      <View style={[styles.dishContainer]}>

        <View style={{ flex: 1 }}>

          <Text style={[styles.modalTitle, { fontSize: 14 }]}>{item.name}</Text>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Calorias</Text>
            <Text style={styles.text}>{item.calories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Fibra</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{item.fiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Carbohidratos</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{item.carbohydrates} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Grasas</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{item.fat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Proteinas</Text>
            <Text style={[styles.text, darkMode && { color: '#fff' }]}>{item.protein} g</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 5, marginTop: 3 }}>
            {item.vegetarian && <Text style={[style.label, style.labelVegetarian]}>Vegetariano</Text>}
            {item.vegan && <Text style={[style.label, style.labelVegan]}>Vegano</Text>}
            {item.gluten_free && <Text style={[style.label, style.labelGlutenFree]}>Sin Gluten</Text>}
          </View>

        </View>

      </View>
    )
  };
  {/*funcion para renderizar un ingrediente con sus gramos en la lista del plato*/ }
  const renderIngredientWithGrams = (item, index) => {

    if (!item || !item.ingredient) return null;
    const { ingredient, grams } = item;

    return (
      <TouchableOpacity key={ingredient.id} onPress={() => { showModal(index, grams) }} onLongPress={() => handleDeleteIngredient(index)}>
        <View style={[styles.dishContainer, darkMode && { backgroundColor: '#2a2a2a', borderColor: '#444' }]}>

          <View style={{ flex: 1 }}>
            <View key={ingredient.id} >
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
          </View>
        </View>
      </TouchableOpacity>

    )
  };

  const handleAddIngredient = (selectedIngredient) => {
    // Mostrar modal para pedir los gramos
    setSelectedIngredientToAdd(selectedIngredient);
    setTempGrams('100');
    setShowAddIngredientGramsModal(true);
  };

  const handleConfirmAddIngredient = () => {
    if (!selectedIngredientToAdd) return;

    const parsedGrams = parseInt(tempGrams);
    if (isNaN(parsedGrams) || parsedGrams <= 0) {
      Alert.alert('Error', 'Por favor ingrese una cantidad válida de gramos');
      return;
    }

    dish.addIngredient({ ingredient: selectedIngredientToAdd, grams: parsedGrams });
    setIngredientsWithGrams([...dish.getIngredientsWithGrams()]);

    setShowAddIngredientGramsModal(false);
    setSelectedIngredientToAdd(null);
    setTempGrams('100');
    searchMenuRef.current?.cerrarMenu?.();
  };

  {/*funcion para eliminar un ingrediente del plato*/ }
  const handleDeleteIngredient = (index) => {
    const currentIngredients = dish.getIngredientsWithGrams();
    if (currentIngredients && currentIngredients.length > index) {
      currentIngredients.splice(index, 1);
      setIngredientsWithGrams([...currentIngredients]);
    }
  };

  {/*funcion para renderizar la lista de ingredientes del plato*/ }
  const renderIngredientList = () => {
    return (
      <>
        {(ingredientsWithGrams || []).map((ing, idx) => renderIngredientWithGrams(ing, idx))}
      </>
    );
  };

  const handleSelectGrams = (index, grams) => {
    const ingredientWithGrams = dish.getIngredientsWithGrams()[index];
    if (ingredientWithGrams) {
      ingredientWithGrams.grams = grams;
      setIngredientsWithGrams([...dish.getIngredientsWithGrams()]);
    }
  };

  const renderAddIngredientGramsModal = () => {
    return (
      <Modal visible={showAddIngredientGramsModal} transparent animationType="fade" onRequestClose={() => setShowAddIngredientGramsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Cuántos gramos de {selectedIngredientToAdd?.name}?</Text>
            <Text style={styles.modalSubtitle}>Los valores nutricionales en la base de datos están por 100g</Text>
            <LabelTextInput
              label="Cantidad en gramos"
              placeholder="100"
              onChangeText={setTempGrams}
              value={tempGrams}
              keyboardType="numeric"
              maxLength={6}
            />
            <View style={styles.modalButtons}>
              <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={() => setShowAddIngredientGramsModal(false)} style={[styles.modalButton, { backgroundColor: '#ccc' }]}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmAddIngredient} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Añadir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSelectGramsModal = () => {
    const currentIngredient = ingredientsWithGrams[selectedIngredientIndex]?.ingredient;

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && { backgroundColor: '#1e1e1e' }]}>
            <Text style={[styles.modalTitle, darkMode && { color: '#fff' }]}>Cambiar gramos de {currentIngredient?.name}</Text>
            <LabelTextInput
              label="Introduzca la cantidad de gramos deseada"
              placeholder="Gramos..."
              placeholderTextColor={darkMode ? "#666" : "#999"}
              onChangeText={setGrams}
              value={grams?.toString()}
              keyboardType="numeric"
              maxLength={6}
              style={[darkMode && { backgroundColor: '#2a2a2a', borderColor: '#444', color: '#fff' }]}
            />
            <View style={styles.modalButtons}>
              <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={hideModal} style={[styles.modalButton, { backgroundColor: '#ccc' }]}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleUpdateGrams()} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Actualizar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  };

  const showModal = (index, gramsValue) => {
    setSelectedIngredientIndex(index);
    setGrams(gramsValue);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setGrams(null);
    setSelectedIngredientIndex(null);
  };

  const handleUpdateGrams = () => {
    if (selectedIngredientIndex !== null && grams) {
      const parsedGrams = parseInt(grams);
      if (!isNaN(parsedGrams) && parsedGrams > 0) {
        handleSelectGrams(selectedIngredientIndex, parsedGrams);
        hideModal();
      } else {
        showAppModal('error', 'Cantidad inválida', 'Por favor ingrese una cantidad válida de gramos antes de continuar.');
      }
    }
  };

  const renderSaveChangesButton = (creatingDish) => {
    if (creatingDish) {
      return (
        <TouchableOpacity style={styles.button} onPress={saveDish}>
          <Text style={styles.buttonText}>{creatingDish ? "Guardar Plato" : "Guardar Cambios"}</Text>
        </TouchableOpacity>

      )
    }
  };


  // Guarda el plato
  const saveDish = async () => {
    try {
      // Validar que tenga nombre
      if (!name || name.trim() === '') {
        Alert.alert('Error', 'Por favor ingresa un nombre para el plato');
        return;
      }

      // Validar que tenga al menos un ingrediente
      if (!ingredientsWithGrams || ingredientsWithGrams.length === 0) {
        Alert.alert('Error', 'Por favor añade al menos un ingrediente al plato');
        return;
      }

      // Obtener userID del AsyncStorage
      const userDocId = await AsyncStorage.getItem("userDocId");
      if (!userDocId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario. Por favor inicia sesión nuevamente.');
        return;
      }

      // Calcular macronutrientes
      const totals = calculateTotals(dish);

      // Preparar datos del plato para el backend
      const mealData = {
        name: name.trim(),
        imgUrl: selectedUri,
        createdBy: userDocId,
        ingredients: ingredientsWithGrams.map(({ ingredient, grams }) => ({
          id: ingredient.id,
          name: ingredient.name,
          calories: ingredient.calories,
          fiber: ingredient.fiber,
          carbohydrates: ingredient.carbohydrates,
          fat: ingredient.fat,
          protein: ingredient.protein,
          grams: grams,
        })),
        calories: totals.totalCalories,
        kcal: totals.totalCalories,
        fiber: totals.totalFiber,
        carbs: totals.totalCarbs,
        carbohydrates: totals.totalCarbs,
        fat: totals.totalFat,
        protein: totals.totalProtein,
        vegetarian: dish.vegetarian || false,
        vegan: dish.vegan || false,
        gluten_free: dish.gluten_free || false,
      };

      // Guardar el plato en el backend
      console.log('📨 Guardando plato en el backend:', mealData);
      const response = await saveMeal(mealData);

      // Obtener el ID del plato guardado
      const savedDishId = response.id;
      console.log('✅ Plato guardado con ID:', savedDishId);

      // Actualizar el objeto del plato con el ID del backend
      dish.id = savedDishId;
      dish.name = name;
      dish.imgUrl = selectedUri;
      dish.calories = totals.totalCalories;
      dish.fiber = totals.totalFiber;
      dish.carbohydrates = totals.totalCarbs;
      dish.fat = totals.totalFat;
      dish.protein = totals.totalProtein;
      dish.ingredients = ingredientsWithGrams;

      // Serializar dish para añadirlo al grupo
      const dishToAdd = {
        id: savedDishId,
        name: dish.name,
        imgUrl: dish.imgUrl,
        ingredients: ingredientsWithGrams,
        calories: dish.calories,
        fiber: dish.fiber,
        carbohydrates: dish.carbohydrates,
        fat: dish.fat,
        protein: dish.protein,
        vegetarian: dish.vegetarian || false,
        vegan: dish.vegan || false,
        gluten_free: dish.gluten_free || false,
      };

      // Añadir el plato al grupo (array de platos de la dieta)
      addingGroup.push(dishToAdd);

      setDishName('');
      setDishDescription('');

      showAppModal('success', 'Plato guardado', 'El plato se ha guardado correctamente en tu colección.');
    } catch (err) {
      console.error('Error saving dish:', err);
      showAppModal('error', 'Error al guardar', 'No se pudo guardar el plato. Verifica tu conexión e inténtalo de nuevo.');
    }
  };

  return (
    <>
      <View style={[styles.container, darkMode && { backgroundColor: '#121212' }]}>
        <StatusBar style={darkMode ? "light" : "auto"} />

        <Header title="Nuevo plato" showBackButton={true} />

        <ScrollView contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: '#121212' }]} showsVerticalScrollIndicator={false}>
          <View style={styles.grupoContainer}>

            <LabelTextInput
              label="Nombre del plato"
              placeholder="Nombre..."
              placeholderTextColor={darkMode ? "#666" : "#999"}
              onChangeText={setName}
              value={name}
              style={[darkMode && { backgroundColor: '#2a2a2a', borderColor: '#444', color: '#fff' }]}
            />

            <Text style={[styles.grupoTitulo, { marginTop: 15 }, darkMode && { color: '#ef2b2d' }]}>Ingredientes</Text>

            <TouchableOpacity
              style={[styles.addDishButton, darkMode && { borderColor: '#444' }]}
              onPress={() => searchMenuRef.current?.abrirMenu()}
            >
              <Text style={[styles.addDishButtonText, darkMode && { color: '#fff' }]}>+ Añadir ingrediente</Text>
            </TouchableOpacity>

            {renderIngredientList()}

            <Text style={[styles.grupoTitulo, darkMode && { color: '#ef2b2d' }]}>Totales</Text>

            <View style={styles.totalsContainer}>
              <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Calorías</Text>
              <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateTotals(dish).totalCalories} kcal</Text>
            </View>

            <View style={styles.totalsContainer}>
              <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Fibra</Text>
              <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateTotals(dish).totalFiber} g</Text>
            </View>

            <View style={styles.totalsContainer}>
              <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Carbohidratos</Text>
              <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateTotals(dish).totalCarbs} g</Text>
            </View>

            <View style={styles.totalsContainer}>
              <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Grasas</Text>
              <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateTotals(dish).totalFat} g</Text>
            </View>

            <View style={styles.totalsContainer}>
              <Text style={[styles.title_3, darkMode && { color: '#aaa' }]}>Proteína</Text>
              <Text style={[styles.text, darkMode && { color: '#fff' }]}>{calculateTotals(dish).totalProtein} g</Text>
            </View>

            <Text style={[styles.grupoTitulo, { marginTop: 10 }, darkMode && { color: '#ef2b2d' }]}>Elegir imagen</Text>

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

            {renderSaveChangesButton(creatingDish)}

          </View>
        </ScrollView>

        {/* render modal para seleccionar gramos */}
        {renderSelectGramsModal()}

        {/* render modal para añadir ingrediente con gramos */}
        {renderAddIngredientGramsModal()}

        {/*menu buscar ingredientes*/}
        <SearchMenu
          ref={searchMenuRef}
          data={allAvailableIngredients}
          dataButton="Todos los ingredientes"
          title="Agregar ingrediente al plato"
          searchFields={["name"]}
          renderCustomItem={renderIngredientItemMenu}
          onSelectItem={handleAddIngredient}
          searchPlaceholder="Buscar ingrediente..."
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
};