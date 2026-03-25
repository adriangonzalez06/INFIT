import React, { useState, useRef, useMemo } from 'react';
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

const { height } = Dimensions.get('window');


export default function DietView({ route }) {

  const navigation = useNavigation();

  {/*-------CONSTANTES MENU DESPLEGABLE--------*/ }
  {/*SearchMenu ref para abrirlo desde el boton*/ }
  const searchMenuRef = useRef(null);

  // Rehydrate route params into a Diet instance so instance methods work
  const diet = useMemo(() => Diet.from(route?.params), [route?.params]);
  console.log('diet:', diet);

  {/*dishes placeholder, leer los datos de la base de datos*/ }
  var dish1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var dish2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var dish3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);

  const [dishes] = useState(diet.getAllDishes ? diet.getAllDishes() : [dish1, dish2, dish3]);
  const [allAvailableDishes] = useState([dish1, dish2, dish3]);



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

