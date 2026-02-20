import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, ImageBackground
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './stylesheet';

export default function ListaGrupoRecetas({ route }) {
  const navigation = useNavigation();

  const { name, recipes } = route?.params || { name: '', recipes: [] };
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  {/* render a card*/ }
  const renderDietCard = (diet) => {
    return (
      <TouchableOpacity
        key={diet.id}
        style={[styles.recipeCards, styles.recetaCardGroup, darkMode && { backgroundColor: '#000', borderColor: '#000' }]}
        onPress={() => {
          handleEnterDiet(diet);
        }}>

        <ImageBackground source={typeof diet.imgUrl === 'number' ? diet.imgUrl : { uri: diet.imgUrl }} resizeMode="cover" style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: -1, borderRadius: 14, overflow: 'hidden' }}>
          <Text style={styles.recetaTextoTitulo}>{diet.name}</Text>
          <Text style={styles.recetaTexto}>Subtítulo</Text>
        </ImageBackground>

      </TouchableOpacity>
    );
  };

  {/*Enter a diet card handler*/ }
  const handleEnterDiet = (diet) => {
    if (!diet) {
      console.warn('handleEntrarDiet: diet is undefined');
      return;
    }
    // Pass diet inside the params object so AddDietMenu receives it as route.params.diet
    navigation.navigate('AddDietMenu', { diet });
  };

  return (

    <View style={[styles.container, darkMode && { backgroundColor: '#000' }]}>
      <StatusBar style={darkMode ? "light" : "auto"} />

      <View style={styles.header}>
        {/* go back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        {/* title */}
        <Text style={[styles.title, darkMode && { color: '#fff' }]}>{name}</Text>
      </View>

      {/* render groups */}
      <ScrollView contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: '#000' }]} showsVerticalScrollIndicator={false}>

        {recipes.map((diet) => (
          renderDietCard(diet)
        ))}

      </ScrollView>
    </View>

  );
}