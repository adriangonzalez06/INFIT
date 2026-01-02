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

export default function CreateDishMenu({ route }) {

    const navigation = useNavigation();
    const { height } = Dimensions.get('window');

    //id, name, imgUrl, calories, fiber, carbohydrates, fat, protein)
    let in1 = new Ingredient(1, "Manzana", "url", 30, 2, 12, 2, 3);
    let in2 = new Ingredient(1, "Carne", "url", 40, 4, 14, 3, 1);

    {/*array de platos al que añadir el plato (mis platos)*/ }
    // Asegurarse de que addingGroup sea siempre un array (maneja route.params undefined/null y valores no array)
    const addingGroup = Array.isArray(route?.params?.dishes) ? route.params.dishes : [];

    // Rehydrate route.params.diet into a Diet instance so instance methods work
    // if there's no dish (when creating) it'll start as null
    const dish = useMemo(() => {
    const rawDish = route?.params?.dish;
    return rawDish ? Dish.from(rawDish) : null;
    }, [route?.params?.dish]);

    {/* If its null it means that we are creating a dish*/ }
    let creatingDish = false;
    if (!dish) creatingDish = true;

    {/*array de todos los ingredientes*/ }
    const allAvailableIngredients = [in1, in2];

    {/* setters */}
    const [ingredient, setIngredient] = useState();
    const [name, setName] = useState();

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

          <Text style={styles.grupoTitulo}>Totales</Text>

          <Text style={styles.grupoTitulo}>Elegir imagen</Text>


        </View>
      </ScrollView >


    </View>
    );

};