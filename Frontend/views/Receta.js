import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';

export default function Receta() {
  const navigation = useNavigation();

  var nombreReceta = "Receta de ejemplo";
  var descripcionReceta = "Esta es una descripción de ejemplo para la receta.";

  var nombrePrimerPlato = "Ensalada César";
  var caloriasPrimerPlato = 250;

  var nombreSegundoPlato = "Pollo al horno";
  var caloriasSegundoPlato = 450;

  var caloriasTotales = caloriasPrimerPlato + caloriasSegundoPlato;

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

