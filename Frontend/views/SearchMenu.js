import React, { useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
     Animated, FlatList, Dimensions
} from 'react-native';
import styles from './stylesheet';


export default function SearchMenu({ onSelectItem }) {


     const abrirMenu = (tipo) => {
        setTipoMenu(tipo);
        setMostrarMenu(true);
        setSearchText("");
        Animated.timing(slideAnim, {
          toValue: height * 0.2, // posición inicial del bottom sheet
          duration: 300,
          useNativeDriver: false
        }).start();
      };
    
      const cerrarMenu = () => {
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: false
        }).start(() => {
          setMostrarMenu(false);
          setTipoMenu(null);
        });
      };

        const panResponder = useRef(
          PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
            onPanResponderMove: (_, gestureState) => {
              if (gestureState.dy > 0) {
                slideAnim.setValue(height * 0.2 + gestureState.dy);
              }
            },
            onPanResponderRelease: (_, gestureState) => {
              if (gestureState.dy > 100) {
                cerrarMenu();
              } else {
                Animated.timing(slideAnim, {
                  toValue: height * 0.2,
                  duration: 200,
                  useNativeDriver: false
                }).start();
              }
            }
          })
        ).current;


  const filteredData = data.filter(item =>
    item.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

    return (

        <Animated.View
          style={[styles.bottomSheet, { top: slideAnim }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <Text style={styles.sheetTitle}>
            {tipoMenu === "ejercicios" ? "Ejercicios Disponibles" : "Alimentos Disponibles"}
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchText}
            onChangeText={setSearchText}
          />

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </Animated.View>

    )
};