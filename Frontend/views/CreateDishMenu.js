import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  SafeAreaView, Image, ImageBackground, Animated, Dimensions, FlatList, Alert
} from 'react-native';
import AppModal from './AppModal';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import styles from './stylesheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Diet from '../src/objects/Diet';
import Dish from '../src/objects/Dish';
import Ingredient from '../src/objects/Ingredient';
import style from './stylesheet';
import colors from './colors';
import { LabelTextInput } from '../src/components/LabelTextInput';
import { SearchMenu } from '../src/components/SearchMenu';
import Header from '../src/components/Header';
import { getAllIngredients } from '../src/services/IngredientsService';
import { saveMeal } from '../src/services/MealsService';

const { width, height } = Dimensions.get('window');

export default function CreateDishMenu({ route }) {
  const navigation = useNavigation();
  const imgMenuRef = useRef(null);
  const searchMenuRef = useRef(null);

  // Estado para almacenar todos los ingredientes cargados desde la BD
  const [allAvailableIngredients, setAllAvailableIngredients] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Cargar ingredientes desde la base de datos al montar el componente
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const ingredients = await getAllIngredients();
        if (ingredients && ingredients.length > 0) {
          setAllAvailableIngredients(ingredients);
        } else {
          setAllAvailableIngredients([]);
        }
      } catch (error) {
        console.error('❌ Error cargando ingredientes:', error);
        setAllAvailableIngredients([]);
      }
    };
    loadIngredients();
  }, []);

  // Cargar preferencia de tema
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  // imagenes para la dieta
  const images = [
    { id: 1, name: 'fruta fitness saludable', url: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg' },
    { id: 2, name: 'bascula perder peso', url: 'https://images.pexels.com/photos/53404/scale-diet-fat-health-53404.jpeg' },
    { id: 3, name: 'Comida fitness fruta', url: 'https://img.freepik.com/foto-gratis/lay-flat-ensalada-botella-jugo_23-2148262146.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 4, name: 'pollo arroz', url: 'https://images.pexels.com/photos/105588/pexels-photo-105588.jpeg' },
    { id: 5, name: 'pollo arroz', url: 'https://images.pexels.com/photos/35367044/pexels-photo-35367044.jpeg' },
    { id: 6, name: 'huevo codorniz', url: 'https://images.pexels.com/photos/6701181/pexels-photo-6701181.jpeg' },
    { id: 7, name: 'proteina pescado carne huevos proteico', url: 'https://img.freepik.com/foto-gratis/vista-arriba-verdadera-piramide-alimentaria_23-2150238929.jpg' },
    { id: 8, name: 'gym gimnasio pesa fuerza musculo', url: 'https://img.freepik.com/foto-gratis/pesos-ejercicio-pesas-fuerte-atletica_1139-709.jpg' },
    { id: 9, name: 'perder peso', url: 'https://img.freepik.com/foto-gratis/mujer-midiendo-su-barriga-peso_53876-13564.jpg' },
    { id: 10, name: 'perder peso', url: 'https://img.freepik.com/foto-gratis/vista-angulo-alto-vegetales-crudos-pesas-sobre-fondo-madera_23-2147882042.jpg' },
  ];

  const addingGroup = Array.isArray(route?.params?.dish) ? route.params.dish : [];
  const dish = useMemo(() => Dish.from(route?.params?.dish) || new Dish(null, '', '', [], false, false, false), [route?.params?.dish]);
  const creatingDish = !route?.params?.dish || (route?.params?.dish && !route.params.dish.id);

  const [name, setName] = useState(dish?.name || '');
  const [grams, setGrams] = useState(null);
  const [visible, setModalVisible] = useState(false);
  const [selectedUri, setSelectedUri] = useState(dish?.imgUrl || images[0].url);
  const [ingredientsWithGrams, setIngredientsWithGrams] = useState(dish?.getIngredientsWithGrams() || []);
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null);

  const [showAddIngredientGramsModal, setShowAddIngredientGramsModal] = useState(false);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);
  const [tempGrams, setTempGrams] = useState('100');
  const [appModal, setAppModal] = useState({ visible: false, type: 'info', title: '', message: '' });

  const showAppModal = (type, title, message) => setAppModal({ visible: true, type, title, message });
  const hideAppModal = () => {
    const wasSuccess = appModal.type === 'success';
    setAppModal(m => ({ ...m, visible: false }));
    if (wasSuccess) {
      navigation.goBack();
    }
  };

  const calculateTotals = (dishInstance) => {
    let totals = { calories: 0, fiber: 0, carbs: 0, fat: 0, protein: 0 };
    const currentIngredients = dishInstance.getIngredientsWithGrams();

    currentIngredients.forEach(({ ingredient, grams: g }) => {
      if (!ingredient) return;
      totals.calories += (ingredient.calories * g) / 100;
      totals.fiber += (ingredient.fiber * g) / 100;
      totals.carbs += (ingredient.carbohydrates * g) / 100;
      totals.fat += (ingredient.fat * g) / 100;
      totals.protein += (ingredient.protein * g) / 100;
    });

    return {
      kcal: totals.calories.toFixed(0),
      protein: totals.protein.toFixed(1),
      carbs: totals.carbs.toFixed(1),
      fat: totals.fat.toFixed(1),
      fiber: totals.fiber.toFixed(1),
      rawKcal: totals.calories,
      rawProtein: totals.protein,
      rawCarbs: totals.carbs,
      rawFat: totals.fat,
      rawFiber: totals.fiber
    };
  };

  const totals = useMemo(() => calculateTotals(dish), [ingredientsWithGrams]);

  const handleSetImage = (url) => {
    setSelectedUri(url);
    dish.setUrl(url);
  };

  const handleAddIngredient = (selectedIngredient) => {
    setSelectedIngredientToAdd(selectedIngredient);
    setTempGrams('100');
    setShowAddIngredientGramsModal(true);
  };

  const handleConfirmAddIngredient = () => {
    if (!selectedIngredientToAdd) return;
    const parsedGrams = parseInt(tempGrams);
    if (isNaN(parsedGrams) || parsedGrams <= 0) {
      Alert.alert('Error', 'Por favor ingrese una cantidad válida de gramos');
      return;
    }
    dish.addIngredient({ ingredient: selectedIngredientToAdd, grams: parsedGrams });
    setIngredientsWithGrams([...dish.getIngredientsWithGrams()]);
    setShowAddIngredientGramsModal(false);
    setSelectedIngredientToAdd(null);
    searchMenuRef.current?.cerrarMenu?.();
  };

  const handleDeleteIngredient = (index) => {
    const currentIngredients = dish.getIngredientsWithGrams();
    if (currentIngredients && currentIngredients.length > index) {
      currentIngredients.splice(index, 1);
      setIngredientsWithGrams([...currentIngredients]);
    }
  };

  const handleUpdateGrams = () => {
    if (selectedIngredientIndex !== null && grams) {
      const parsedGrams = parseInt(grams);
      if (!isNaN(parsedGrams) && parsedGrams > 0) {
        const currentIngredients = dish.getIngredientsWithGrams();
        currentIngredients[selectedIngredientIndex].grams = parsedGrams;
        setIngredientsWithGrams([...currentIngredients]);
        hideModal();
      } else {
        showAppModal('error', 'Cantidad inválida', 'Por favor ingrese una cantidad válida de gramos.');
      }
    }
  };

  const hideModal = () => {
    setModalVisible(false);
    setGrams(null);
    setSelectedIngredientIndex(null);
  };

  const showModal = (index, gramsValue) => {
    setSelectedIngredientIndex(index);
    setGrams(gramsValue.toString());
    setModalVisible(true);
  };

  const saveDish = async () => {
    try {
      if (!name || name.trim() === '') {
        Alert.alert('Error', 'Por favor ingresa un nombre para el plato');
        return;
      }
      if (ingredientsWithGrams.length === 0) {
        Alert.alert('Error', 'Por favor añade al menos un ingrediente');
        return;
      }

      const userDocId = await AsyncStorage.getItem("userDocId");
      if (!userDocId) {
        Alert.alert('Error', 'Sesión expirada. Inicia sesión de nuevo.');
        return;
      }

      const mealData = {
        name: name.trim(),
        imgUrl: selectedUri,
        createdBy: userDocId,
        ingredients: ingredientsWithGrams.map(({ ingredient, grams: g }) => ({
          id: ingredient.id,
          name: ingredient.name,
          calories: ingredient.calories,
          fiber: ingredient.fiber,
          carbohydrates: ingredient.carbohydrates,
          fat: ingredient.fat,
          protein: ingredient.protein,
          grams: g,
        })),
        calories: totals.rawKcal,
        kcal: totals.rawKcal,
        fiber: totals.rawFiber,
        carbs: totals.rawCarbs,
        carbohydrates: totals.rawCarbs,
        fat: totals.rawFat,
        protein: totals.rawProtein,
        vegetarian: dish.vegetarian || false,
        vegan: dish.vegan || false,
        gluten_free: dish.gluten_free || false,
      };

      const response = await saveMeal(mealData);
      dish.id = response.id;
      dish.name = name;
      dish.imgUrl = selectedUri;

      const dishToAdd = { ...mealData, id: response.id };
      addingGroup.push(dishToAdd);

      showAppModal('success', '¡Plato guardado!', 'El plato se ha guardado correctamente.');
    } catch (err) {
      console.error('Error saving dish:', err);
      showAppModal('error', 'Error', 'No se pudo guardar el plato.');
    }
  };

  const MacroCard = ({ label, value, unit, icon, color, bgColor }) => (
    <View style={[localStyles.macroCard, { backgroundColor: darkMode ? '#1A1A1A' : '#FFFFFF' }, darkMode && { borderColor: '#333', borderWidth: 1 }]}>
      <View style={[localStyles.macroIconContainer, { backgroundColor: bgColor }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={[localStyles.macroValue, { color: darkMode ? '#FFF' : '#333' }]}>{value}</Text>
      <Text style={localStyles.macroLabel}>{label}</Text>
      {unit && <Text style={localStyles.macroUnit}>{unit}</Text>}
    </View>
  );

  const IngredientItem = ({ item, index }) => {
    const { ingredient, grams: g } = item;
    return (
      <TouchableOpacity
        style={[localStyles.ingredientCard, { backgroundColor: darkMode ? '#1A1A1A' : '#F8F9FA' }]}
        onPress={() => showModal(index, g)}
        onLongPress={() => {
          Alert.alert('Eliminar ingrediente', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', onPress: () => handleDeleteIngredient(index), style: 'destructive' }
          ]);
        }}
      >
        <View style={localStyles.ingredientHeader}>
          <Text style={[localStyles.ingredientName, { color: darkMode ? '#FFF' : '#333' }]}>{ingredient.name}</Text>
          <View style={localStyles.gramsBadge}>
            <Text style={localStyles.gramsText}>{g}g</Text>
          </View>
        </View>
        <View style={localStyles.ingredientMacros}>
          <Text style={localStyles.miniMacro}>{(ingredient.calories * g / 100).toFixed(0)} kcal</Text>
          <Text style={localStyles.miniMacroSeparator}>•</Text>
          <Text style={localStyles.miniMacro}>{(ingredient.protein * g / 100).toFixed(1)} P</Text>
          <Text style={localStyles.miniMacroSeparator}>•</Text>
          <Text style={localStyles.miniMacro}>{(ingredient.carbohydrates * g / 100).toFixed(1)} C</Text>
          <Text style={localStyles.miniMacroSeparator}>•</Text>
          <Text style={localStyles.miniMacro}>{(ingredient.fat * g / 100).toFixed(1)} G</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: '#121212' }]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Header title="Nuevo Plato" showBackButton={true} darkMode={darkMode} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Foto de Portada */}
        <TouchableOpacity
          style={localStyles.imageSection}
          onPress={() => imgMenuRef.current?.abrirMenu()}
        >
          <Image source={{ uri: selectedUri }} style={localStyles.mainImage} />
          <View style={[localStyles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <View style={localStyles.changePhotoBtn}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text style={localStyles.changePhotoText}>Cambiar Imagen</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={localStyles.contentContainer}>
          {/* Input Nombre */}
          <View style={localStyles.inputWrapper}>
            <Text style={[localStyles.sectionLabel, darkMode && { color: '#CCC' }]}>Nombre del plato</Text>
            <TextInput
              placeholder="Ej: Pollo con Arroz..."
              placeholderTextColor="#777"
              value={name}
              onChangeText={setName}
              style={[localStyles.mainInput, darkMode && { backgroundColor: '#1E1E1E', color: '#FFF', borderColor: '#333' }]}
            />
          </View>

          {/* Macro Dashboard */}
          <View style={localStyles.macroGrid}>
            <MacroCard label="Fibra" value={totals.fiber} unit="g" icon="🌿" color="#4ade80" bgColor={darkMode ? 'rgba(74, 222, 128, 0.15)' : '#E8F5E9'} />
            <MacroCard label="Carbs" value={totals.carbs} unit="g" icon="🌾" color="#facc15" bgColor={darkMode ? 'rgba(250, 204, 21, 0.15)' : '#FFF8E1'} />
            <MacroCard label="Grasas" value={totals.fat} unit="g" icon="🧈" color="#f97316" bgColor={darkMode ? 'rgba(249, 115, 22, 0.15)' : '#E3F2FD'} />
            <MacroCard label="Proteína" value={totals.protein} unit="g" icon="💪" color="#a78bfa" bgColor={darkMode ? 'rgba(167, 139, 250, 0.15)' : '#FFEBEE'} />
          </View>

          {/* Ingredientes */}
          <View style={localStyles.ingredientsSection}>
            <View style={localStyles.sectionHeader}>
              <Text style={[localStyles.sectionTitle, darkMode && { color: '#FFF' }]}>Ingredientes</Text>
              <TouchableOpacity
                style={[localStyles.addBtn, darkMode && { backgroundColor: 'rgba(239, 43, 45, 0.2)' }]}
                onPress={() => searchMenuRef.current?.abrirMenu()}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
                <Text style={localStyles.addBtnText}>Añadir</Text>
              </TouchableOpacity>
            </View>

            {ingredientsWithGrams.length === 0 ? (
              <View style={[localStyles.emptyState, darkMode && { backgroundColor: '#1A1A1A', borderColor: '#333' }]}>
                <MaterialCommunityIcons name="food-apple-outline" size={40} color="#555" />
                <Text style={localStyles.emptyText}>No has añadido ingredientes todavía</Text>
              </View>
            ) : (
              ingredientsWithGrams.map((item, idx) => (
                <IngredientItem key={idx} item={item} index={idx} />
              ))
            )}
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity onPress={saveDish} activeOpacity={0.8} style={localStyles.saveBtnWrapper}>
            <View
              style={[localStyles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={localStyles.saveBtnText}>{creatingDish ? "Crear Plato" : "Guardar Cambios"}</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modales */}
      <Modal visible={showAddIngredientGramsModal} transparent animationType="fade" onRequestClose={() => setShowAddIngredientGramsModal(false)}>
        <View style={localStyles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[localStyles.modalContent, darkMode && { backgroundColor: '#1E1E1E' }]}>
            <Text style={[localStyles.modalTitle, darkMode && { color: '#FFF' }]}>{selectedIngredientToAdd?.name}</Text>
            <Text style={[localStyles.modalSub, darkMode && { color: '#888' }]}>Indica la cantidad en gramos</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor="#555"
              value={tempGrams}
              onChangeText={setTempGrams}
              style={[localStyles.modalInput, darkMode && { color: '#FFF', borderColor: '#ef2b2d' }]}
              autoFocus
            />
            <View style={localStyles.modalBtnsRow}>
              <TouchableOpacity onPress={() => setShowAddIngredientGramsModal(false)} style={[localStyles.modalCancel, darkMode && { backgroundColor: '#2A2A2A' }]}>
                <Text style={[localStyles.modalCancelText, darkMode && { color: '#BBB' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmAddIngredient} style={localStyles.modalConfirm}>
                <Text style={localStyles.modalConfirmText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
        <View style={localStyles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[localStyles.modalContent, darkMode && { backgroundColor: '#1E1E1E' }]}>
            <Text style={[localStyles.modalTitle, darkMode && { color: '#FFF' }]}>Editar gramos</Text>
            <TextInput
              keyboardType="numeric"
              value={grams}
              onChangeText={setGrams}
              style={[localStyles.modalInput, darkMode && { color: '#FFF', borderColor: '#ef2b2d' }]}
              autoFocus
            />
            <View style={localStyles.modalBtnsRow}>
              <TouchableOpacity onPress={hideModal} style={[localStyles.modalCancel, darkMode && { backgroundColor: '#2A2A2A' }]}>
                <Text style={[localStyles.modalCancelText, darkMode && { color: '#BBB' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateGrams} style={localStyles.modalConfirm}>
                <Text style={localStyles.modalConfirmText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menús de Selección */}
      <SearchMenu
        ref={searchMenuRef}
        data={allAvailableIngredients}
        title="Buscar Ingrediente"
        searchFields={["name"]}
        renderCustomItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAddIngredient(item)} style={[localStyles.menuItem, darkMode && { borderBottomColor: '#222' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[localStyles.menuItemName, darkMode && { color: '#FFF' }]}>{item.name}</Text>
              <Text style={localStyles.menuItemSub}>{item.calories} kcal • {item.protein}P • {item.carbohydrates}C • {item.fat}G</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#999" />
          </TouchableOpacity>
        )}
        searchPlaceholder="Escribe el nombre..."
        height={height * 0.8}
        numColumns={1}
      />

      <SearchMenu
        ref={imgMenuRef}
        data={images}
        title="Elegir Imagen"
        searchFields={["name"]}
        renderCustomItem={({ item }) => (
          <TouchableOpacity onPress={() => { handleSetImage(item.url); imgMenuRef.current?.cerrarMenu?.(); }} style={localStyles.imgMenuItem}>
            <Image source={{ uri: item.url }} style={localStyles.imgMenuPic} />
          </TouchableOpacity>
        )}
        searchPlaceholder="Buscar imagen..."
        height={height * 0.6}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 15 }}
      />

      <AppModal
        visible={appModal.visible}
        type={appModal.type}
        title={appModal.title}
        message={appModal.message}
        onConfirm={hideAppModal}
        darkMode={darkMode}
      />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  imageSection: {
    width: '100%',
    height: height * 0.25,
    position: 'relative',
    backgroundColor: '#EEE',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  changePhotoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contentContainer: {
    padding: 20,
    marginTop: -20,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    marginBottom: 25,
    marginTop: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 5,
  },
  mainInput: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  macroCard: {
    width: (width - 60) / 4,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  macroIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
  },
  macroLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginTop: 2,
  },
  macroUnit: {
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  ingredientsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 43, 45, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 5,
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  ingredientCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  gramsBadge: {
    backgroundColor: '#EEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gramsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  ingredientMacros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniMacro: {
    fontSize: 13,
    color: '#888',
  },
  miniMacroSeparator: {
    marginHorizontal: 8,
    color: '#DDD',
  },
  saveBtnWrapper: {
    marginVertical: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 15,
    color: '#999',
    marginTop: 5,
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderBottomWidth: 2,
    borderColor: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 30,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '700',
  },
  modalConfirm: {
    flex: 2,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuItemSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  imgMenuItem: {
    width: (width - 50) / 2,
    height: 120,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  imgMenuPic: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});