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
import AsyncStorage from '@react-native-async-storage/async-storage';

import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import Ingredient from '../src/objects/Ingredient';

import style from './stylesheet';
import colors from './colors';
import { LabelTextInput } from '../src/components/LabelTextInput';
import { SearchMenu } from '../src/components/SearchMenu';


export default function CreateDishMenu({ route }) {

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

  const imgMenuRef = useRef(null);
  const searchMenuRef = useRef(null);

  //id, name, imgUrl, calories, fiber, carbohydrates, fat, protein)
  let in1 = new Ingredient(1, "Manzana", "url", 30, 2, 12, 2, 3);
  let in2 = new Ingredient(2, "Carne", "url", 40, 4, 14, 3, 1);
  let in3 = new Ingredient(3, "Huevo", "url", 50, 4, 14, 3, 1);

  let ingredients = [
    { ingredient: in1, grams: 150 },
    { ingredient: in2, grams: 110 },
    { ingredient: in3, grams: 50 },
  ];

  {/*array de todos los ingredientes*/ }
  const allAvailableIngredients = [in1, in2, in3];

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

  // Rehydrate route.params.dish into a Dish instance so instance methods work
  const dish = useMemo(() => Dish.from(route?.params?.dish) || new Dish(null, '', '', [], false, false, false), [route?.params?.dish]);

  {/* If its null it means that we are creating a dish*/ }
  let creatingDish = false;
  if (!dish) creatingDish = true;

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
    <TouchableOpacity onPress={() => { handleAddIngredient(item); searchMenuRef.current?.cerrarMenu?.(); }}>
      {renderIngredientBody({ item })}
    </TouchableOpacity>
  );


  {/*renderizar cuerpo del ingrediente*/ }
  const renderIngredientBody = ({ item }) => {

    return (

      <View style={[styles.dishContainer]}>

        <View style={{ marginLeft: 10, flex: 1 }}>

          <Text style={[styles.modalTitle, { fontSize: 14 }]}>{item.name}</Text>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Calorias</Text>
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
            <Text style={styles.title_3}>Proteinas</Text>
            <Text style={styles.text}>{item.protein} g</Text>
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
      <TouchableOpacity key={ingredient.id} onPress={() => { showModal(renderSelectGramsModal(item, index)) }} onLongPress={() => handleDeleteIngredient(index)}>
        <View style={[styles.dishContainer]}>

          <View style={{ marginLeft: 10, flex: 1 }}>
            <View key={ingredient.id} >
              <Text style={styles.title_2}>{grams}g de {ingredient.name}</Text>

              <View style={styles.totalsContainer}>
                <Text style={styles.title_3}>Calorías</Text>
                <Text style={styles.text}>{(ingredient.calories * grams) / 100} kcal</Text>
              </View>

              <View style={styles.totalsContainer}>
                <Text style={styles.title_3}>Fibra</Text>
                <Text style={styles.text}>{(ingredient.fiber * grams) / 100} g</Text>
              </View>

              <View style={styles.totalsContainer}>
                <Text style={styles.title_3}>Carbohidratos</Text>
                <Text style={styles.text}>{(ingredient.carbohydrates * grams) / 100} g</Text>
              </View>

              <View style={styles.totalsContainer}>
                <Text style={styles.title_3}>Grasas</Text>
                <Text style={styles.text}>{(ingredient.fat * grams) / 100} g</Text>
              </View>

              <View style={styles.totalsContainer}>
                <Text style={styles.title_3}>Proteína</Text>
                <Text style={styles.text}>{(ingredient.protein * grams) / 100} g</Text>
              </View>

            </View>
          </View>
        </View>
      </TouchableOpacity>

    )
  };

  const handleAddIngredient = (selectedIngredient) => {
    dish.addIngredient({ ingredient: selectedIngredient, grams: 100 });
    setIngredientsWithGrams([...dish.getIngredientsWithGrams()]);
  };

  {/*funcion para eliminar un ingrediente del plato*/ }
  const handleDeleteIngredient = (index) => {
    // borra por índice del día seleccionado
    dish.ingredientsWithGrams.splice(index, 1);
    setIngredientsWithGrams([...dish.getIngredientsWithGrams()]);
  };

  {/*funcion para renderizar la lista de ingredientes*/ }
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

  const renderSelectGramsModal = (item, index) => {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}></View>
          <LabelTextInput
            label="Introduzca la cantidad de gramos deseada"
            placeholder="Gramos..."
            onChangeText={handleSelectGrams(index, {item : grams})}
            value={grams}
          />
        </View>
      </Modal>
    )
  };

  const showModal = (ingredients) => {
    setSelectedIngredients(ingredients);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedIngredients([]);
  };

  return (

    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        {/* go back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>

        <Text style={styles.title}>{"Nuevo plato"}</Text>

      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grupoContainer}>

          <LabelTextInput
            label="Nombre del plato"
            placeholder="Nombre..."
            onChangeTExt={setName}
            value={name}
          />

          <Text style={styles.grupoTitulo}>Ingredientes</Text>

          <TouchableOpacity
            style={styles.addDishButton}
            onPress={() => searchMenuRef.current?.abrirMenu()}
          >
            <Text>+ Añadir ingrediente</Text>
          </TouchableOpacity>

          {renderIngredientList()}

          <Text style={styles.grupoTitulo}>Totales</Text>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Calorías</Text>
            <Text style={styles.text}>{calculateTotals(dish).totalCalories} kcal</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Fibra</Text>
            <Text style={styles.text}>{calculateTotals(dish).totalFiber} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Carbohidratos</Text>
            <Text style={styles.text}>{calculateTotals(dish).totalCarbs} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Grasas</Text>
            <Text style={styles.text}>{calculateTotals(dish).totalFat} g</Text>
          </View>

          <View style={styles.totalsContainer}>
            <Text style={styles.title_3}>Proteína</Text>
            <Text style={styles.text}>{calculateTotals(dish).totalProtein} g</Text>
          </View>


          <Text style={styles.grupoTitulo}>Elegir imagen</Text>

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

        </View>
      </ScrollView >

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
  );

};