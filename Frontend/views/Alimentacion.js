import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import colors from './colors.js';
import { Receta } from '../objects/Recipe';
import { Plato } from '../objects/Dish'; 
import { DebugObjects } from '../objects/DebugObjects';

export default function Alimentacion() {

  const navigation = useNavigation();

  {/*platos placeholder, leer los datos de la base de datos*/}
  var plato1 = new Plato(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var plato2 = new Plato(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var plato3 = new Plato(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);
  var plato4 = new Plato(4, "Pescado", "url4", 600, ["ingrediente1", "ingrediente2"], 600, false, false, false);
  var plato5 = new Plato(5, "Sopa", "url5", 300, ["ingrediente1", "ingrediente2"], 300, true, true, true);
  var plato6 = new Plato(6, "Pasta", "url6", 700, ["ingrediente1", "ingrediente2"], 700, false, true, false);

  {/* recetas de prueba*/}
  var r1 = new Receta(1, "Dieta Balanceada", "url1", [plato1, plato2, plato3]);
  var r2 = new Receta(2, "Dieta Vegana", "url2", [plato2, plato3, plato6],);
  var r3 = new Receta(3, "Dieta Cetogénica", "url3", [plato4, plato5]);
  var r4 = new Receta(4, "Dieta Mediterránea", "url4", [plato5, plato1, plato6]);
  var r5 = new Receta(5, "Dieta Alta en Proteínas", "url5", [plato3]);
  var r6 = new Receta(6, "Dieta Baja en Carbohidratos", "url6", [plato5]);


  const [recetas] = useState({
    grupo1: [r1, r2],
    grupo2: [r3, r4],
    grupo3: [r5, r6],
    grupo4: [r1, r4],
    grupo5: [r3, r5],
    grupo6: [r4, r2],
  });

  const renderGrupo = (titulo, recetasGrupo, grupoKey, addCard) => (
    <View style={styles.grupoContainer}>
      {/* group title */}
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      {/* recipes row */}
      <View style={styles.recetasRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          {/* map displays a list of the items that are inside the function */}
          {recetasGrupo.map((receta) => (
            renderRecetaCard(receta)
          ))}

          {showAddCard(addCard)}

          <TouchableOpacity 
          style={styles.seeMoreCard}
          onPress={() => handleEntrarGrupoCompleto()}>
            <Ionicons name="arrow-forward" size={24} color="#111114" />
            <Text style={{ color: '##111114', fontWeight: '600' }}>Ver más</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </View>
  );

  {/* render a card*/}
  const renderRecetaCard = (receta) => {
    return (
          <TouchableOpacity
            key={receta.id}
            style={styles.recetaCard}
            onPress={() => {
              console.log('receeta: ', receta),
              handleEntrarReceta(receta);
            }}>

            <ImageBackground source={require('../assets/images/images_diet/diet_01.jpg')} resizeMode="cover" style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden'}}>
            <Text style={styles.recetaTextoTitulo}>{receta.nombre}</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
            </ImageBackground>
          </TouchableOpacity>
    );
  };

  {/* ahow add more card if true */}
  const showAddCard = (show) => {
      if (show) {
        return (
        <TouchableOpacity style={[styles.addCard]}>
          <Ionicons name="add" size={32} color="#ef2b2d" />
        </TouchableOpacity>
      );
    }
    return null;
  }

  {/*Enter a recipe card handler*/}
  const handleEntrarReceta = (receta) => {
    if (!receta) {
          console.warn('handleEntrarReceta: receta is undefined');
          return;
        }
        navigation.navigate('Receta', { receta });
  };

  {/*See More button handler*/}
  const handleEntrarGrupoCompleto = () => {
    navigation.navigate('ListaGrupoRecetas');
  };


  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>Alimentación</Text>

      {/* render groups */}
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          {renderGrupo('Trending', recetas.grupo1, 'grupo1')}
          {renderGrupo('Mis dietas', recetas.grupo2, 'grupo2', true)}
          {renderGrupo('Para ganar músculo', recetas.grupo3, 'grupo3')}
          {renderGrupo('Para mantener la figura', recetas.grupo4, 'grupo4')}
          {renderGrupo('Para mantener la figura', recetas.grupo5, 'grupo5')}
          {renderGrupo('Para mantener la figura', recetas.grupo6, 'grupo6')}
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

