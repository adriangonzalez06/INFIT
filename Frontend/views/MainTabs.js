// views/MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './WelcomeScreen';
import ChatBot from './ChatBot';
import ProfileScreen from './profile';
import Buscar from './Buscar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Bienvenida" component={WelcomeScreen} />
      <Stack.Screen name="Rutinas" component={RutinasScreen} />
      <Stack.Screen name="Alimentacion" component={AlimentacionScreen} />
      <Stack.Screen name="ChatBot" component={ChatBot} />
    </Stack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Bienvenida"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ef2b2d',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Bienvenida':
              iconName = 'home-outline';
              break;
            case 'ChatBot':
              iconName = 'hardware-chip-outline';
              break;
            case 'Buscar':
              iconName = 'search-outline';
              break;
            case 'Perfil':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Bienvenida" component={HomeStack} />
      <Tab.Screen name="ChatBot" component={ChatBot}/>
      <Tab.Screen name="Buscar" component={Buscar}/>
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
