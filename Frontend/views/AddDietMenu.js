import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView, Image, ImageBackground, Animated, Dimensions, FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import { useRoute } from '@react-navigation/native';
import Diet from '../objects/Diet';
import Dish from '../objects/Dish';
import { SearchMenu } from './SearchMenu';

import style from './stylesheet';

export default function DietView({ }) {

  const navigation = useNavigation();
  const { height } = Dimensions.get('window');

  {/*dishes placeholder, leer los datos de la base de datos*/}
  var dish1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var dish2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var dish3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);
  
  {/*array de todos los platos*/}
  const allAvailableDishes = [dish1, dish2, dish3];

  const newDietRef = useRef(new Diet());
  const newDiet = newDietRef.current;
  
  // selectedDay: 0 = Lunes, 1 = Martes, ... 6 = Domingo
  const [selectedDay, setSelectedDay] = useState(0);
  const [dishes, setDishes] = useState(newDiet.getDishesForDay(0));

    {/*Totales de la diet*/}
  const totalCalories = ( dishes.reduce((sum,p) => sum + (p?.calories || 0), 0) );
  const totalMacronutrients = ( dishes.reduce((sum,p) => sum + (p?.macronutrients || 0), 0) );

 {/*variables para list de caracteristicas (vegan, vegetarian, gluten)*/}
  let nextId = 0;
  const [cars, setCars] = useState([]);

  {/*modal ingredients*/}
  const [visible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  
  {/*-------CONSTANTES MENU DESPLEGABLE--------*/}
  {/*SearchMenu ref para abrirlo desde el boton*/}
  const searchMenuRef = useRef(null);
  
  {/*funcion para agregar un plato a la dieta*/}
  const handleAddDish = (selectedDish) => {
    // Añade el plato al día seleccionado dentro de newDiet
    newDiet.addDishToDay(selectedDay, selectedDish);
    // Actualiza el estado local para re-renderizar la lista del día
    setDishes([...newDiet.getDishesForDay(selectedDay)]);
  };

  {/*componente personalizado para renderizar items en el SearchMenu*/}
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
  {/*-------------------------------------------*/}

    {/*funciones para mostrar/ocultar modal ingredients*/}
  const showModal = (ingredients) => {
    setSelectedIngredients(ingredients ?? []);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedIngredients([]);
  };

  {/*funcion para renderizar cada dish de la diet*/}
  const renderPlato = (dish) => {
    return (
          <TouchableOpacity key={dish.id} onPress={() => showModal(dish.ingredients)} onLongPress={() => newDiet.deleteDishFromDay}>
            <View style={styles.dishContainer}>
              <Image
                style={styles.dishImage}
                source={ typeof dish.imgUrl === 'number' ? dish.imgUrl : { uri: dish.imgUrl } }
              />
              <View style={{ margin: 5, flex: 1 }}>
                <Text style={styles.dishTitle}>{dish.name}</Text>

                <Text style={styles.dishSubtitle}>Calorías</Text>
                  <Text style={styles.dishText}>{dish.calories} kcal</Text>

                <Text style={styles.dishSubtitle}>Macronutrientes</Text>
                  <Text style={styles.dishText}>{dish.macronutrients} g</Text>

                {renderCharacteristics(dish).length > 0 && (
                  <Text style={styles.dishText}>{renderCharacteristics(dish)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
    );
  };

  {/*funcion para renderizar las caracteristicas de cada dish*/}
  const renderCharacteristics = (dish) => {
    const list = [];
    if (dish.vegan) list.push('Vegano');
    if (dish.vegetarian) list.push('Vegetariano');
    if (dish.gluten_free) list.push('Sin Gluten');
    return list.length ? list.join(', ') : '';
  };

  {/*funcion para renderizar la list de dishes*/}
  const renderDishList = () => {
    return (dishes || []).map((dish) => renderPlato(dish));
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


  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>Crear una dieta</Text>


      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.grupoContainer}>

                <View style={styles.daysContainer}>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(0); setDishes(newDiet.getDishesForDay(0)); }}><Text>LUN</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(1); setDishes(newDiet.getDishesForDay(1)); }}><Text>MAR</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(2); setDishes(newDiet.getDishesForDay(2)); }}><Text>MIE</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(3); setDishes(newDiet.getDishesForDay(3)); }}><Text>JUE</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(4); setDishes(newDiet.getDishesForDay(4)); }}><Text>VIE</Text></TouchableOpacity>
                </View>
                <View style={[styles.daysContainer, { justifyContent: 'center' }]}>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(5); setDishes(newDiet.getDishesForDay(5)); }}><Text>SAB</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(6); setDishes(newDiet.getDishesForDay(6)); }}><Text>DOM</Text></TouchableOpacity>
                </View>

                {/*renderizar todos los dishes que haya en el día seleccionado*/}
                {renderDishList()}

                <TouchableOpacity 
                style={styles.addDishButton}
                onPress={() => searchMenuRef.current?.abrirMenu()}
                >
                <Text>+ Añadir plato</Text>
                </TouchableOpacity>

                <Text style={styles.grupoTitulo}>Totales</Text>


                <Text style={styles.grupoTitulo}> - Diario</Text>
                <View style={styles.totalsContainer}>
                    <Text style={styles.totalsTitle}>Calorías</Text>
                    <Text style={styles.totalsText}>{totalCalories} kcal</Text>
                </View>

                <View style={styles.totalsContainer}>
                  <Text style={styles.totalsTitle}>Macronutrientes</Text>
                  <Text style={styles.totalsText}>{totalMacronutrients} g</Text>
                </View>

                <Text style={styles.grupoTitulo}> - Semanal</Text>
                <View style={styles.totalsContainer}>
                    <Text style={styles.totalsTitle}>Calorías</Text>
                    <Text style={styles.totalsText}>{totalCalories} kcal</Text>
                </View>

                <View style={styles.totalsContainer}>
                  <Text style={styles.totalsTitle}>Macronutrientes</Text>
                  <Text style={styles.totalsText}>{totalMacronutrients} g</Text>
                </View>

                <TouchableOpacity style={styles.saveButton}><Text style={styles.button}>Guardar Dieta</Text></TouchableOpacity>

            </View>
      </ScrollView>

      {renderIngredientsModal()}

      <SearchMenu 
                    ref={searchMenuRef}
                    data={allAvailableDishes}
                    title="Agregar Plato a la Dieta"
                    searchFields={["name"]}
                    renderCustomItem={renderDishItemMenu}
                    onSelectItem={handleAddDish}
                    searchPlaceholder="Buscar plato..."
                    height={height}
                />

    </View>

  );
}

