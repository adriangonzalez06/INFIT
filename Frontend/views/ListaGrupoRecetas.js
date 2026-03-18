import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './stylesheet';
import colors from './colors';

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

  {/*Enter a diet card handler*/ }
  const handleEnterDiet = (diet) => {
    if (!diet) {
      console.warn('handleEntrarDiet: diet is undefined');
      return;
    }
    // Pass diet inside the params object so AddDietMenu receives it as route.params.diet
    navigation.navigate('AddDietMenu', { diet });
  };

  {/* render a card */ }
  const renderDietCard = (diet) => {
    return (
      <TouchableOpacity
        key={diet.id}
        style={[styles.recetaCardGroup, styles.recipeCards, darkMode && styles.darkRecipeCard]}
        onPress={() => handleEnterDiet(diet)}
      >
        <ImageBackground
          source={typeof diet.imgUrl === 'number' ? diet.imgUrl : { uri: diet.imgUrl }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 14, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.gradientOverlay}
          />
          <Text style={styles.recetaTextoTitulo}>{diet.name}</Text>
          <Text style={styles.recetaTexto}>Subtítulo</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (

    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: colors.bg_dark }]}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{name}</Text>
      </View>


      {/* render groups */}
      <ScrollView contentContainerStyle={[styles.scrollContent, darkMode && { backgroundColor: colors.bg_dark }]} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 10 }}>
          {recipes.map((diet) => (
            renderDietCard(diet)
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>


  );
}