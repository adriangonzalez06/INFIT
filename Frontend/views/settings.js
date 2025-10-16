import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function SettingsScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Ajustes
      </Text>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Unidades</Text>
      </Pressable>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Idioma</Text>
      </Pressable>


      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Cambiar contraseña</Text>
      </Pressable>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Cambiar correo electrónico</Text>
      </Pressable>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Valóranos</Text>
      </Pressable>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Borrar caché</Text>
      </Pressable>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Borrar todos los datos</Text>
      </Pressable>

      <Pressable
          onPress={() => {
            //funcion
          }}
          style={({pressed}) => [{backgroundColor: pressed ? '#fdd' : 'white',}, styles.optionBorder ]}>
          <Text>Política de privacidad</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeeeff',
    alignItems: 'left',
    padding: 30,
  },
    title: {
        fontSize: 30,
        marginBottom: 20,
    },
    optionBorder: {
        borderRadius: 8,
        padding: 10,
        margin: 5,
  },
 });