import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import Dish from '../objects/Dish';
import { useRoute } from '@react-navigation/native';
import { DebugObjects } from '../objects/DebugObjects';
import { Receta } from '../objects/Recipe';


export default function RecetaView() {

  var r1 = new Receta(1, "Dieta Balanceada", "url1", [plato1, plato2, plato3]);

  const route = useRoute();
  const navigation = useNavigation();

  const receta = r1;
  console.log('RecetaView recibe receta:', r1);

    //var id_plato, nombre, fotoUrl, macronutrientes, ingredientes, aporte_calorico, vegetariano, vegano, sin_gluten;

  var nombreReceta = "Receta Ejemplo";
  var descripcionReceta = "Esta es una descripción de ejemplo para la receta. Aquí se detallan los pasos para preparar el plato y cualquier otra información relevante.";

  {/*platos placeholder, leer los datos de la base de datos*/}
  var plato1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var plato2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var plato3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);

  const [platos] = useState(receta?.platos ?? [plato1, plato2, plato3]);

  {/*Totales de la receta*/}
  var caloriasTotales = plato1.aporte_calorico + plato2.aporte_calorico;

 {/*variables para lista de caracteristicas (vegano, gluten)*/}
  let nextId = 0;
  const [cars, setCars] = useState([]);


  {/*funcion para renderizar cada plato de la receta*/}
  const renderPlato = (plato) => {
    return (
          <View style={styles.platoContainer} key={plato.id_plato}>
            <Image
              style={styles.platoImage}
              source={ typeof plato.fotoUrl === 'number' ? plato.fotoUrl : { uri: plato.fotoUrl } }
            />          
              <View style={{ margin: 5, flex: 1 }}>  
              <Text style={styles.dishTitle}>{plato.nombre}</Text>

              <Text style={styles.dishSubtitle}>Calorías</Text>
                <Text style={styles.dishText}>{plato.aporte_calorico} kcal</Text>

              <Text style={styles.dishSubtitle}>Macronutrientes</Text>
                <Text style={styles.dishText}>{plato.macronutrientes} g</Text>

              <Text style={styles.dishSubtitle}>Ingredientes {Array.isArray(plato.ingredientes) ? plato.ingredientes.join(', ') : plato.ingredientes}</Text>
              {renderCaracteristicas(plato).length > 0 && (
                <Text style={styles.platoText}>{renderCaracteristicas(plato)}</Text>
              )}
            </View>
          </View>
    );
  };

  {/*funcion para renderizar las caracteristicas de cada plato*/}
  const renderCaracteristicas = (plato) => {
    const lista = [];
    if (plato.vegano) lista.push('Vegano');
    if (plato.vegetariano) lista.push('Vegetariano');
    if (plato.sin_gluten) lista.push('Sin Gluten');
    return lista.length ? lista.join(', ') : '';
  };

  {/*funcion para renderizar la lista de platos*/}
  const renderPlatoList = () => {
    return platos.map((plato) => renderPlato(plato))
    }


  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>Nombre de la receta</Text>

      {/* render groups */}
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
            <View style={styles.grupoContainer}>

                <Text style={styles.grupoTitulo}>{receta.nombre}</Text>
                <Text style={styles.text}>{descripcionReceta}</Text>

                <Text style={styles.grupoTitulo}>Platos</Text>

                {/*renderizar todos los platos que haya en la receta*/}
                {renderPlatoList()}

                <Text style={styles.grupoTitulo}>Totales</Text>
                <Text style={styles.text}>Calorías: {caloriasTotales} kcal</Text>

            </View>
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

