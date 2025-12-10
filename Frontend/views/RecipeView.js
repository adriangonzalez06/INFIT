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
import Recipe from '../objects/Recipe';
import Dish from '../objects/Dish';

export default function RecipeView({ route }) {

  const navigation = useNavigation();

  const receta = route?.params?.receta ?? route?.params ?? null;

  {/*platos placeholder, leer los datos de la base de datos*/}
  var plato1 = new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var plato2 = new Dish(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var plato3 = new Dish(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);

  const [platos] = useState(receta?.platos ?? [plato1, plato2, plato3]);

  {/*Totales de la receta*/}
  const caloriasTotales = ( (receta?.platos ?? [plato1, plato2, plato3]) .reduce((sum,p) => sum + (p?.aporte_calorico || 0), 0) );
  const macronutrientesTotales = ( (receta?.platos ?? [plato1, plato2, plato3]) .reduce((sum,p) => sum + (p?.macronutrientes || 0), 0) );

 {/*variables para lista de caracteristicas (vegano, gluten)*/}
  let nextId = 0;
  const [cars, setCars] = useState([]);

  {/*modal ingredientes*/}
  const [modalVisible, setModalVisible] = useState(false);


  {/*funcion para renderizar cada plato de la receta*/}
  const renderPlato = (plato) => {
    return (
          <View style={styles.platoContainer} key={plato.id_plato} onClick={() => setModalVisible(true)}>
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

  const renderModalIngredients = (ingredientes) => {

    {/* Modal para ver ingredientes */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>

                <Text style={styles.modalTitle}>Ingredientes</Text>

                <Text style={styles.modalText}>{ingredientes.join(', ')}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>
  }


  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>{receta.nombre}</Text>

      {/* render groups */}
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
            <View style={styles.grupoContainer}>

                <Text style={styles.text}>{receta.description}</Text>

                <Text style={styles.grupoTitulo}>Platos</Text>

                {/*renderizar todos los platos que haya en la receta*/}
                {renderPlatoList()}

                <Text style={styles.grupoTitulo}>Totales</Text>

                <View style={styles.totalsContainer}>
                    <Text style={styles.totalsTitle}>Calorías</Text>
                    <Text style={styles.totalsText}>{caloriasTotales} kcal</Text>
                </View>

                <View style={styles.totalsContainer}>
                  <Text style={styles.totalsTitle}>Macronutrientes</Text>
                  <Text style={styles.totalsText}>{macronutrientesTotales} g</Text>
                </View>

            </View>
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

