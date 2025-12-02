import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';
import plato from './Plato';

export default function Receta() {
  const navigation = useNavigation();
    //var id_plato, nombre, fotoUrl, macronutrientes, ingredientes, aporte_calorico, vegetariano, vegano, sin_gluten;

  var plato1 = new plato(1, "Nombre1", "url1", 400, ["ingrediente1", "ingrediente2"], 500, false, false, true);
  var plato2 = new plato(1, "Nombre2", "url2", 550, ["ingrediente1", "ingrediente2"], 550, true, false, true);


  var caloriasTotales = plato1.apo + caloriasSegundoPlato;

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

                <Text style={styles.grupoTitulo}>{nombreReceta}</Text>
                <Text style={styles.text}>{descripcionReceta}</Text>

                <Text style={styles.grupoTitulo}>Platos</Text>

                <Text style={styles.grupoTitulo}>{nombrePrimerPlato}</Text>
                <Text style={styles.text}>Calorías: {caloriasPrimerPlato} kcal</Text>

                <Text style={styles.grupoTitulo}>{nombreSegundoPlato}</Text>
                <Text style={styles.text}>Calorías: {caloriasSegundoPlato} kcal</Text>
                
                <Text style={styles.grupoTitulo}>Calorías Totales</Text>
                <Text style={styles.text}>{caloriasTotales} kcal</Text>

            </View>
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}

