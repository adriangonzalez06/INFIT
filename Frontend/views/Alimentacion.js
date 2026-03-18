import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, ImageBackground, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './stylesheet.js';
import Dish from '../src/objects/Dish.js';
import Diet from '../src/objects/Diet.js';
import DietGroup from '../src/objects/DietGroup.js';
import { getAllMeals } from '../src/services/MealsService';
import AppModal from './AppModal';
import colors from './colors';

import { BACKEND_URL } from '../src/config';

export default function Alimentacion() {

  const navigation = useNavigation();

  /* ---------- dark mode ---------- */
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        setDarkMode(savedTheme === 'true');
      };

      const loadMeals = async () => {
        try {
          const meals = await getAllMeals();
          if (meals && meals.length > 0) {
            const dishesFromDB = meals.map((meal, index) => {
              const rawIngredients = meal.ingredients || [];
              const ingredientsWithGrams = Array.isArray(rawIngredients)
                ? rawIngredients.map(i =>
                  typeof i === 'object' && i.ingredient
                    ? i
                    : { ingredient: { name: i, calories: 0, fiber: 0, carbohydrates: 0, fat: 0, protein: 0 }, grams: 0 }
                )
                : [];

              return new Dish(
                meal.id || index,
                meal.name,
                meal.imgUrl || require('../assets/images/images_dish/dish_01.jpg'),
                ingredientsWithGrams,
                meal.vegetarian || false,
                meal.vegan || false,
                meal.gluten_free || false,
                meal.calories || 0
              );
            });
            setAllDishes(dishesFromDB);
          }
        } catch (error) {
          console.error('❌ Error cargando platos:', error);
        }
      };

      loadTheme();
      loadMeals();
    }, [])
  );

  /* ---------- platos desde Firestore ---------- */
  const [allDishes, setAllDishes] = useState([]);

  // Cargamos los platos inicialmente (aunque useFocusEffect lo volverá a hacer)
  useEffect(() => {
    // Ya lo hace el useFocusEffect arriba
  }, []);

  /* ---------- dietas personalizadas del usuario ---------- */
  const [userPersonalizedDiets, setUserPersonalizedDiets] = useState([]);

  /* ---------- CRUD bottom-sheet (solo "Mis dietas") ---------- */
  const [dietaSeleccionada, setDietaSeleccionada] = useState(null);
  const [opcionesVisible, setOpcionesVisible] = useState(false);

  const handleLongPressDieta = (diet) => {
    setDietaSeleccionada(diet);
    setOpcionesVisible(true);
  };

  const handleEliminarDieta = async () => {
    if (!dietaSeleccionada) return;
    try {
      const userDocId = await AsyncStorage.getItem('userDocId');
      const url = `${BACKEND_URL}/api/infopersonalizeddiet/${dietaSeleccionada.id}?userId=${userDocId}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      // Actualizar estado local sin recargar
      setUserPersonalizedDiets(prev => prev.filter(d => d.id !== dietaSeleccionada.id));
      console.log('✅ Dieta eliminada:', dietaSeleccionada.id);
    } catch (error) {
      console.error('❌ Error eliminando dieta:', error);
    }
    setOpcionesVisible(false);
  };

  const handleEditarDieta = () => {
    setOpcionesVisible(false);
    if (dietaSeleccionada) {
      navigation.navigate('AddDietMenu', { diet: dietaSeleccionada, isPersonalized: true });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const loadUserPersonalizedDiets = async () => {
        try {
          const userDocId = await AsyncStorage.getItem('userDocId');
          if (!userDocId) {
            console.warn('⚠️ No se encontró userDocId');
            return;
          }

          const url = `${BACKEND_URL}/api/infopersonalizeddiet/user/${userDocId}`;

          console.log('📥 Cargando dietas de:', url);
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error('Error al cargar dietas personalizadas');
          }

          const diets = await response.json();
          console.log('✅ Dietas personalizadas cargadas:', diets.length);

          if (isMounted) {
            setUserPersonalizedDiets(diets || []);
          }
        } catch (error) {
          console.error('❌ Error cargando dietas personalizadas:', error);
          if (isMounted) {
            setUserPersonalizedDiets([]);
          }
        }
      };

      loadUserPersonalizedDiets();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  {/*cargar platos desde Firestore al montar el componente*/ }
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const meals = await getAllMeals();
        if (meals && meals.length > 0) {
          const dishesFromDB = meals.map((meal, index) =>
            new Dish(
              meal.id || index,
              meal.name,
              meal.imgUrl || require('../assets/images/images_dish/dish_01.jpg'),
              [],  // Don't pass Firestore string ingredients - use dish macros instead
              meal.vegetarian || false,
              meal.vegan || false,
              meal.gluten_free || false,
              meal.calories || meal.kcal || 0,
              meal.fiber || 0,
              meal.carbs || 0,
              meal.fat || 0,
              meal.protein || 0
            )
          );
          setAllDishes(dishesFromDB);
          console.log('✅ Platos cargados en Alimentacion:', dishesFromDB.length);
        } else {
          // Si no hay platos, usar fallback
          console.warn('⚠️  No se obtuvieron platos, usando fallback');
          setAllDishes([]);
        }
      } catch (error) {
        console.error('❌ Error cargando platos:', error);
        setAllDishes([]);
      }
    };

    loadMeals();
  }, []);

  {/* diets de prueba - usar platos dinámicos */ }
  const createDefaultDiets = () => {
    let dishes = allDishes;
    if (dishes.length === 0) {
      dishes = [
        new Dish(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), [], true, true, false),
        new Dish(2, "Carne", require('../assets/images/images_dish/dish_02.jpg'), [], false, false, false),
        new Dish(3, "Postre", require('../assets/images/images_dish/dish_03.jpg'), [], false, false, false),
        new Dish(4, "Pescado", require('../assets/images/images_dish/dish_04.jpg'), [], false, false, false),
        new Dish(5, "Sopa", require('../assets/images/images_dish/dish_05.jpg'), [], true, true, false),
        new Dish(6, "Pasta", require('../assets/images/images_dish/dish_06.jpg'), [], false, false, false),
      ];
    }

    const p1 = dishes[0] || new Dish(1, "Plato 1", require('../assets/images/images_dish/dish_01.jpg'), [], false, false, false);
    const p2 = dishes[1] || new Dish(2, "Plato 2", require('../assets/images/images_dish/dish_02.jpg'), [], false, false, false);
    const p3 = dishes[2] || new Dish(3, "Plato 3", require('../assets/images/images_dish/dish_03.jpg'), [], false, false, false);
    const p4 = dishes[3] || new Dish(4, "Plato 4", require('../assets/images/images_dish/dish_04.jpg'), [], false, false, false);
    const p5 = dishes[4] || new Dish(5, "Plato 5", require('../assets/images/images_dish/dish_05.jpg'), [], false, false, false);
    const p6 = dishes[5] || new Dish(6, "Plato 6", require('../assets/images/images_dish/dish_06.jpg'), [], false, false, false);

    //Dietas Default Proteina
    const r1 = new Diet(1, 'Dieta Alta en Proteinas 1', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1772624865/proteina_vodu73.webp', [[p2, p3, p6], [p6, p4, p5], [p5, p4, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r2 = new Diet(2, 'Dieta Alta en Proteinas 2', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773219108/A1_qcwhti.avif', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r3 = new Diet(3, 'Dieta Alta en Proteinas 3', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773220122/a3_hllirt.avif', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    //Dietas Default Baja en Carbohidratos
    const r4 = new Diet(4, 'Dieta Baja en Carbohidratos 1', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1772624663/mediterrania_wwn3wb.jpg', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r5 = new Diet(5, 'Dieta Baja en Carbohidratos 2', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773219191/a2_rswweq.jpg', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r6 = new Diet(6, 'Dieta Baja en Carbohidratos 3', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773220652/B_g7qfdq.png', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    //Dietas Default Balanceada
    const r7 = new Diet(7, 'Dieta Balanceada 1', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1772623173/top-view-healthy-diet-salad-with-grilled-chicken-broccoli-cauliflower-tomato-lettuce-avocado-lettuce_plaiob.jpg', [[p2, p3, p6], [p6, p4, p5], [p5, p4, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r8 = new Diet(8, 'Dieta Balanceada 2', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773218578/plato-saludable-carne-molida-verduras-arroz-marron-ensalada-fresca_598644-1780_tni2xo.avif', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r9 = new Diet(9, 'Dieta Balanceada 3', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773220919/11_lrhi3l.jpg', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    //Dietas Default Vegana
    const r10 = new Diet(10, 'Dieta Vegana 1', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1772623960/VEGANA_gxtex5.jpg', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r11 = new Diet(11, 'Dieta Vegana 2', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773218698/A_oq48h9.jpg', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r12 = new Diet(12, 'Dieta Vegana 3', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773221075/2_ts1zhw.avif', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    //Dietas Default Cetogénica
    const r13 = new Diet(13, 'Dieta Cetogénica 1', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1772624464/cetogenica_csds2j.jpg', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r14 = new Diet(14, 'Dieta Cetogénica 2', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773218788/AA_xa2cts.webp', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);
    const r15 = new Diet(15, 'Dieta Cetogénica 3', 'descripcion', 'https://res.cloudinary.com/do0tjcogk/image/upload/v1773221176/3_khfxrf.png', [[p2, p3, p6], [p1, p2, p3], [p5, p1, p6], [p2, p3], [p1, p2, p3], [p5, p1, p6], [p3]]);

    return [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15];
  };

  // Inicializar grupos con dietas por defecto
  const defaultDiets = createDefaultDiets();
  const [recipesGroups, setRecipesGroups] = useState({
    g1: new DietGroup(1, 'Trending', defaultDiets.slice(12, 15)),
    g2: new DietGroup(2, 'Mis dietas', defaultDiets.slice(2, 5), true),
    g3: new DietGroup(3, 'Para ganar músculo', defaultDiets.slice(0, 3)),
    g4: new DietGroup(4, 'Baja en Carbohidratos', defaultDiets.slice(3, 6)),
    g5: new DietGroup(5, 'Balanceada', defaultDiets.slice(6, 9)),
    g6: new DietGroup(6, 'Vegana', defaultDiets.slice(9, 12)),
    g7: new DietGroup(7, 'Cetogénica', defaultDiets.slice(12, 15)),
  });

  // Actualizar recipesGroups cuando userPersonalizedDiets cambia
  useEffect(() => {
    const defaults = createDefaultDiets();

    let personalizedDiets = [];
    if (userPersonalizedDiets && userPersonalizedDiets.length > 0) {
      const dietImages = [
        require('../assets/images/images_diet/diet_02.jpg'),
        require('../assets/images/images_diet/diet_01.jpg'),
      ];

      personalizedDiets = userPersonalizedDiets.map((dietData, index) => {
        let weeklyDishesArray = [[], [], [], [], [], [], []];

        if (dietData.weeklyDishes) {
          if (Array.isArray(dietData.weeklyDishes)) {
            weeklyDishesArray = dietData.weeklyDishes;
          } else if (typeof dietData.weeklyDishes === 'object') {
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
              const dayKey = dayIndex.toString();
              if (dietData.weeklyDishes[dayKey]) {
                weeklyDishesArray[dayIndex] = dietData.weeklyDishes[dayKey];
              }
            }
          }
        }

        const imageIndex = index % dietImages.length;

        return new Diet(
          dietData.id,
          dietData.name,
          dietData.description || '',
          dietData.imgUrl || dietImages[imageIndex],
          weeklyDishesArray
        );
      });
    }

    const g1 = new DietGroup(1, 'Trending', [...defaults.slice(12, 15)]);
    const g2 = new DietGroup(2, 'Mis dietas', personalizedDiets.length > 0 ? [...personalizedDiets] : [...defaults.slice(2, 5)], true);
    const g3 = new DietGroup(3, 'Para ganar músculo', [...defaults.slice(0, 3)]);
    const g4 = new DietGroup(4, 'Baja en Carbohidratos', [...defaults.slice(3, 6)]);
    const g5 = new DietGroup(5, 'Balanceada', [...defaults.slice(6, 9)]);
    const g6 = new DietGroup(6, 'Vegana', [...defaults.slice(9, 12)]);
    const g7 = new DietGroup(7, 'Cetogénica', [...defaults.slice(12, 15)]);

    setRecipesGroups({ g1, g2, g3, g4, g5, g6, g7 });
  }, [userPersonalizedDiets]);

  /* ---------- navegación ---------- */
  const handleEnterDiet = (diet) => {
    if (!diet) {
      console.warn('handleEnterDiet: diet is undefined');
      return;
    }
    navigation.navigate('AddDietMenu', { diet });
  };

  const handleEnterGrupoCompleto = (group) => {
    navigation.navigate('ListaGrupoRecetas', {
      name: group.name,
      recipes: group.recipes,
      canEdit: group.canEdit,
    });
  };

  const handleCreateNewDiet = (group) => {
    navigation.navigate('AddDietMenu', { recipes: group.recipes ?? group });
  };

  /* ---------- render helpers ---------- */
  const renderRecetaCard = (diet, canEdit = false) => {
    let imageSource;
    if (typeof diet.imgUrl === 'number') {
      imageSource = diet.imgUrl;
    } else if (typeof diet.imgUrl === 'string' && diet.imgUrl) {
      imageSource = { uri: diet.imgUrl };
    } else {
      imageSource = require('../assets/images/images_diet/diet_02.jpg');
    }

    return (
      <TouchableOpacity
        key={diet.id}
        style={[styles.recetaCard, styles.recipeCards, darkMode && styles.darkRecipeCard]}
        onPress={() => handleEnterDiet(diet)}
        onLongPress={canEdit ? () => handleLongPressDieta(diet) : undefined}
        delayLongPress={400}>

        <ImageBackground
          source={imageSource}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 14, overflow: 'hidden' }}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.gradientOverlay}
          />
          <Text style={styles.recetaTextoTitulo}>{diet.name}</Text>
          {canEdit && (
            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: 4 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>···</Text>
            </View>
          )}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const showAddCard = (show, group) => {
    if (!show) return null;
    return (
      <TouchableOpacity
        style={[styles.addCard, darkMode && { backgroundColor: colors.bg_dark }]}
        onPress={() => handleCreateNewDiet(group)}>
        <Ionicons name="add" size={32} color="#ef2b2d" />
      </TouchableOpacity>
    );
  };


  const renderGrupo = (group) => (
    <View style={styles.grupoContainer}>
      <Text
        style={[
          styles.grupoTitulo,
          { paddingHorizontal: 20 },
          darkMode && { color: '#fff' }
        ]}
      >
        {group.name}
      </Text>

      <View style={styles.recetasRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        >
          {/* Primeras 3 recetas */}
          {group.recipes.slice(0, 3).map((diet) => renderRecetaCard(diet, group.canEdit))}

          {/* Botón de añadir (solo grupos editables) */}
          {showAddCard(group.canEdit, group)}

          {/* Botón VER MÁS */}
          {(group.recipes.length > 3 || !group.canEdit) && (
            <TouchableOpacity
              style={[styles.seeMoreCard, darkMode && styles.darkSeeMoreCard]}
              onPress={() => handleEnterGrupoCompleto(group)}
            >
              <Ionicons
                name="arrow-forward"
                size={24}
                color={darkMode ? '#fff' : '#111114'}
              />
              <Text
                style={{
                  color: darkMode ? '#fff' : '#111114',
                  fontWeight: '600',
                  marginTop: 8
                }}
              >
                Ver más
              </Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </View>
    </View>
  );



  /* ---------- render principal ---------- */
  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: colors.bg_dark }]}>

      {/* ── Bottom sheet opciones dieta ("Mis dietas" only) ── */}
      <Modal visible={opcionesVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setOpcionesVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: darkMode ? '#1a1a1a' : '#fff',
              padding: 24,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              width: '100%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 20,
            }}
          >
            {/* Indicador */}
            <View style={{ width: 40, height: 5, backgroundColor: darkMode ? '#444' : '#ccc', borderRadius: 3, alignSelf: 'center', marginBottom: 15 }} />

            <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 20, color: darkMode ? '#fff' : '#1a1a1a', letterSpacing: -0.5 }}>
              {dietaSeleccionada?.name || 'Opciones'}
            </Text>

            {/* Editar */}
            <TouchableOpacity
              onPress={handleEditarDieta}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: darkMode ? '#333' : '#eee', gap: 15 }}
            >
              <Ionicons name="create-outline" size={22} color={darkMode ? '#ccc' : '#333'} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: darkMode ? '#ccc' : '#333' }}>Editar dieta</Text>
            </TouchableOpacity>

            {/* Eliminar */}
            <TouchableOpacity
              onPress={handleEliminarDieta}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: darkMode ? '#333' : '#eee', gap: 15 }}
            >
              <Ionicons name="trash-outline" size={22} color="#ef2b2d" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef2b2d' }}>Eliminar dieta</Text>
            </TouchableOpacity>

            {/* Cerrar */}
            <TouchableOpacity
              onPress={() => setOpcionesVisible(false)}
              style={{ marginTop: 20, backgroundColor: darkMode ? '#333' : '#eee', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '700', fontSize: 16, color: darkMode ? '#888' : '#666' }}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>


      <StatusBar style={darkMode ? 'light' : 'dark'} />


      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Alimentación</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 20 },
          darkMode && { backgroundColor: colors.bg_dark }
        ]}
        showsVerticalScrollIndicator={false}>

        {renderGrupo(recipesGroups.g1)}
        {renderGrupo(recipesGroups.g2)}
        {renderGrupo(recipesGroups.g3)}
        {renderGrupo(recipesGroups.g4)}
        {renderGrupo(recipesGroups.g5)}
        {renderGrupo(recipesGroups.g6)}
        {renderGrupo(recipesGroups.g7)}
      </ScrollView>
    </SafeAreaView>

  );
}
