import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './stylesheet';

export default function ListaGrupoRecetas() {
  const navigation = useNavigation();

  const handleEntrarReceta = (rutina, grupoKey) => {
    navigation.navigate('PantallaReceta', {
      rutina,
      grupoKey,
    });
  };

  return (

    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* go back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>Nombre del grupo</Text>

      {/* render groups */}
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <SafeAreaView>

          <TouchableOpacity style={styles.recetaCard} onPress={() => navigation.navigate("Receta")}>
            <Text style={styles.recetaTextoTitulo}>Nombre</Text>
            <Text style={styles.recetaTexto}>Subtítulo</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </View>

  );
}