import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Animated,
    FlatList,
    Dimensions,
    PanResponder,
    ScrollView,
    Modal,
    Image,
    StyleSheet
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Diet from '../objects/Diet';
import Dish from '../objects/Dish';
import { SearchMenu } from './SearchMenu';

import styles from '../../views/stylesheet';

  const { height } = Dimensions.get('window');

export const WeeklyItemsMenu = forwardRef(({
    object = null,
    allAvailableDishes = [],
}, ref) => {
    //console.log("object: ", object);
    const searchMenuRef = useRef(null);
    const [showFallbackSearch, setShowFallbackSearch] = useState(false);

    {/*-------STATES-------*/ }
    // selectedDay: 0 = Lunes, 1 = Martes, ... 6 = Domingo
    const [selectedDay, setSelectedDay] = useState(0);

    {/*States de dietas*/ }
    const diet = useMemo(() => {
        if (!object) return new Diet();
        if (typeof object.getDishesForDay === 'function') return object;
        const src = object.diet ?? object;
        return new Diet(src.id, src.name, src.description, src.imgUrl, src.weeklyDishes || []);
    }, [object]);

    const [dishes, setDishes] = useState(diet.getDishesForDay(0));
    const [dietName, setDietName] = useState(diet.name || '');
    const [dietDescription, setDietDescription] = useState(diet.description || '');
    {/*all data of all days*/ }
    const [allDishes, setAllDishes] = useState(diet.getAllDishes());
    {/*Totales de la diet*/ }
    const totalCalories = (dishes.reduce((sum, p) => sum + (p?.calories || 0), 0));
    const totalMacronutrients = (dishes.reduce((sum, p) => sum + (p?.macronutrients || 0), 0));
    {/*modal ingredients*/ }
    const [visible, setModalVisible] = useState(false);
    const [selectedIngredients, setSelectedIngredients] = useState([]);


    {/*-------FUNCIONES--------*/ }
    {/*funciones para mostrar/ocultar modal ingredients*/ }
    const showModal = (ingredients) => {
        setSelectedIngredients(ingredients ?? []);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
        setSelectedIngredients([]);
    };

  {/*funcion para agregar un plato a la dieta*/ }
  const handleAddDish = (selectedDish) => {
        // Añade el plato al día seleccionado dentro de diet
        diet.addDishToDay(selectedDay, selectedDish);
        // Actualiza el estado local para re-renderizar la lista del día
        setDishes([...diet.getDishesForDay(selectedDay)]);
        setAllDishes([...diet.getAllDishes()]);

  };



    {/*funcion para renderizar cada dish de la diet*/ }
    const renderPlato = (dish, index) => {
        return (
            <TouchableOpacity key={dish.id} onPress={() => showModal(dish.ingredients)} onLongPress={() => handleDeleteDish(index)}>
                <View style={styles.dishContainer}>
                    <Image
                        style={styles.dishImage}
                        source={typeof dish.imgUrl === 'number' ? dish.imgUrl : { uri: dish.imgUrl }}
                    />
                    <View style={{ margin: 5, flex: 1 }}>
                        <Text style={styles.dishTitle}>{dish.name}</Text>

                        <Text style={styles.dishSubtitle}>Calorías</Text>
                        <Text style={styles.dishText}>{dish.calories} kcal</Text>

                        {renderCharacteristics(dish).length > 0 && (
                            <Text style={styles.dishText}>{renderCharacteristics(dish)}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };


    {/*funcion para renderizar las caracteristicas de cada dish*/ }
    const renderCharacteristics = (dish) => {
        const list = [];
        if (dish.vegan) list.push('Vegano');
        if (dish.vegetarian) list.push('Vegetariano');
        if (dish.gluten_free) list.push('Sin Gluten');
        return list.length ? list.join(', ') : '';
    };

    {/*funcion para calcular los totales semanales*/ }
    const calculateWeeklyTotals = () => {
        let totalCalories = 0;
        let totalMacronutrients = 0;
        diet.getAllDishes().forEach((dayDishes) => {
            (dayDishes || []).forEach((dish) => {
                totalCalories += (dish?.calories || 0);
                totalMacronutrients += (dish?.macronutrients || 0);
            });
        });

        return { totalCalories, totalMacronutrients };
    };

    {/*funcion para renderizar la list de data*/ }
    const renderDishList = () => {
        return (dishes || []).map((dish, idx) => renderPlato(dish, idx));
    };

    const handleDeleteDish = (index) => {
        // borra por índice del día seleccionado
        diet.weeklyDishes[selectedDay].splice(index, 1);
        setDishes([...diet.getDishesForDay(selectedDay)]);
        setAllDishes([...diet.getAllDishes()]);
    };

    const renderIngredientsModal = () => (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={hideModal}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Ingredientes</Text>
                    <Text style={styles.dishText}>{selectedIngredients.length ? selectedIngredients.join(', ') : 'No hay ingredients'}</Text>


                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={hideModal} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderFallbackSearch = () => (
        <Modal visible={showFallbackSearch} transparent animationType="slide" onRequestClose={() => setShowFallbackSearch(false)}>
            <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
                <View style={[styles.modalContent, { maxHeight: height * 0.6 }]}>
                    <Text style={styles.modalTitle}>Buscar platos</Text>
                    <FlatList
                        data={allAvailableDishes}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => { handleAddDish(item); setShowFallbackSearch(false); }}>
                                <View style={[styles.dishContainer, { marginVertical: 6 }]}>
                                    <Text style={styles.dishTitle}>{item.name}</Text>
                                    <Text style={styles.dishText}>{item.calories} kcal</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setShowFallbackSearch(false)} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );



    // Guarda la dieta  (para probar)
    const saveDiet = async () => {
        try {
            // Actualizar propiedades de object
            diet.id = Date.now();
            diet.name = dietName || `Dieta ${new Date().toLocaleDateString()}`;
            diet.description = dietDescription || '';

            // Serializar diet (convertir a objeto plano)
            const dietToSave = {
                id: diet.id,
                name: diet.name,
                description: diet.description,
                imgUrl: diet.imgUrl,
                weeklyDishes: diet.weeklyDishes
            };

            addingGroup.push(dietToSave);

            setDietName('');
            setDietDescription('');
            setAllDishes([...diet.getAllDishes()]);

            Alert.alert('Guardado', 'La dieta se ha guardado correctamente.');
        } catch (err) {
            console.error('Error saving diet:', err);
            Alert.alert('Error', 'No se pudo guardar la dieta.');
        }
    };

      {/*componente personalizado para renderizar items en el SearchMenu*/ }
      const renderDishItemMenu = ({ item }) => (
        <TouchableOpacity onPress={() => { handleAddDish(item); searchMenuRef.current?.cerrarMenu?.(); }}>
          <View style={[styles.dishContainer, { marginHorizontal: 10, marginVertical: 8 }]}>
            <Image
              style={[styles.dishImage, { width: 80, height: 80, borderRadius: 8 }]}
              source={typeof item.imgUrl === 'number' ? item.imgUrl : { uri: item.imgUrl }}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.dishTitle, { fontSize: 14 }]}>{item.name}</Text>
              <Text style={styles.dishText}>{item.calories} kcal</Text>
              <View style={{ flexDirection: 'row', gap: 5, marginTop: 3 }}>
                {item.vegetarian && <Text style={[style.label, style.labelVegetarian]}>Vegetariano</Text>}
                {item.vegan && <Text style={[style.label, style.labelVegan]}>Vegano</Text>}
                {item.gluten_free && <Text style={[style.label, style.labelGlutenFree]}>Sin Gluten</Text>}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );

      


    return (
        <>
        <View>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.grupoContainer}>

                        <View style={styles.daysContainer}>
                                <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(0); setDishes(diet.getDishesForDay(0)); }}><Text>LUN</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(1); setDishes(diet.getDishesForDay(1)); }}><Text>MAR</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(2); setDishes(diet.getDishesForDay(2)); }}><Text>MIE</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(3); setDishes(diet.getDishesForDay(3)); }}><Text>JUE</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(4); setDishes(diet.getDishesForDay(4)); }}><Text>VIE</Text></TouchableOpacity>
                        </View>
                        <View style={[styles.daysContainer, { justifyContent: 'center' }]}>
                            <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(5); setDishes(diet.getDishesForDay(5)); }}><Text>SAB</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.dayButton} onPress={() => { setSelectedDay(6); setDishes(diet.getDishesForDay(6)); }}><Text>DOM</Text></TouchableOpacity>
                        </View>

                        {/*renderizar todos los data que haya en el día seleccionado*/}
                        {renderDishList()}

                        <TouchableOpacity
                            style={styles.addDishButton}
                            onPress={() => {
                                console.log('searchMenuRef.current ->', searchMenuRef.current);
                                if (searchMenuRef.current?.abrirMenu) {
                                  searchMenuRef.current.abrirMenu();
                                  return;
                                }
                                console.warn('SearchMenu ref is not set — mostrando fallback');
                                setShowFallbackSearch(true);
                            }}
                        >
                            <Text>+ Añadir plato</Text>
                        </TouchableOpacity>

                        <Text style={styles.grupoTitulo}>Totales</Text>

                        <Text style={styles.title_2}>Diario</Text>
                        <View style={styles.totalsContainer}>
                            <Text style={styles.title_3}>Calorías</Text>
                            <Text style={styles.text}>{totalCalories} kcal</Text>
                        </View>

                        <View style={styles.totalsContainer}>
                            <Text style={styles.title_3}>Macronutrientes</Text>
                            <Text style={styles.text}>{totalMacronutrients} g</Text>
                        </View>

                        <Text style={styles.title_2}>Semanal</Text>
                        <View style={styles.totalsContainer}>
                            <Text style={styles.title_3}>Calorías</Text>
                            <Text style={styles.text}>{calculateWeeklyTotals().totalCalories} kcal</Text>
                        </View>

                        <View style={styles.totalsContainer}>
                            <Text style={styles.title_3}>Macronutrientes</Text>
                            <Text style={styles.text}>{calculateWeeklyTotals().totalMacronutrients} g</Text>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={saveDiet}><Text style={styles.button}>Guardar Dieta</Text></TouchableOpacity>

                    </View>
                </ScrollView>

                {renderIngredientsModal()}

            </View>

            {/* SearchMenu mounted outside ScrollView so ref is set and FlatList isn't nested 
            <SearchMenu
                ref={searchMenuRef}
                data={allAvailableDishes}
                title="Buscar platos"
                searchFields={["name", "nombre"]}
                renderCustomItem={renderDishItemMenu}
                onSelectItem={handleAddDish}
                searchPlaceholder="Buscar plato..."
                height={height}
            />*/}

        </>
    );
});