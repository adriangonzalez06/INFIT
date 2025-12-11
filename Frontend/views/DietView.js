import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView, Image, ImageBackground
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import { useRoute } from '@react-navigation/native';
import Diet from '../objects/Diet';
import Dish from '../objects/Dish';

export default function DietView({ route }) {

  const navigation = useNavigation();

  const diet = route?.params?.diet ?? route?.params ?? null;

  {/*dishes placeholder, leer los datos de la base de datos*/}
  var dish1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var dish2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var dish3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);

  const [dishes] = useState(diet?.dishes ?? [dish1, dish2, dish3]);

  {/*Totales de la diet*/}
  const caloriasTotales = ( (diet?.dishes ?? [dish1, dish2, dish3]) .reduce((sum,p) => sum + (p?.calories || 0), 0) );
  const macronutrientsTotales = ( (diet?.dishes ?? [dish1, dish2, dish3]) .reduce((sum,p) => sum + (p?.macronutrients || 0), 0) );

 {/*variables para list de caracteristicas (vegan, vegetarian, gluten)*/}
  let nextId = 0;
  const [cars, setCars] = useState([]);

  {/*modal ingredients*/}
  const [visible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  
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
          <TouchableOpacity key={dish.id_dish} onPress={() => showModal(dish.ingredients)}>
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
    return dishes.map((dish) => renderPlato(dish))

  }

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
      <Text style={styles.title}>{diet.name}</Text>


      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
            <View style={styles.grupoContainer}>

                <Text style={styles.text}>{diet.description}</Text>

                <Text style={styles.grupoTitulo}>Platos</Text>

                {/*renderizar todos los dishes que haya en la diet*/}
                {renderDishList()}

                <Text style={styles.grupoTitulo}>Totales</Text>

                <View style={styles.totalsContainer}>
                    <Text style={styles.totalsTitle}>Calorías</Text>
                    <Text style={styles.totalsText}>{caloriasTotales} kcal</Text>
                </View>

                <View style={styles.totalsContainer}>
                  <Text style={styles.totalsTitle}>Macronutrientes</Text>
                  <Text style={styles.totalsText}>{macronutrientsTotales} g</Text>
                </View>

            </View>
        </SafeAreaView>
      </ScrollView>

      {renderIngredientsModal()}

    </View>

  );
}

