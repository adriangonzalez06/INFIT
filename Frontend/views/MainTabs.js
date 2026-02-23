import React, { useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './WelcomeScreen';
import ChatBot from './ChatBot';
import ProfileScreen from './profile';
import Buscar from './Buscar';
import Rutinas from './Rutinas';
import Alimentacion from './Alimentacion';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const [isDark, setIsDark] = useState(false);

  // Cargar preferencia cada vez que el Tab Navigator está en foco o volvemos a él
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setIsDark(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  return (
    <Tab.Navigator
      initialRouteName="Rutinas"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ef2b2d',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarStyle: {
          backgroundColor: isDark ? '#1e1e1e' : '#fff',
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Rutinas':
              iconName = 'barbell-outline';
              break;
            case 'Alimentacion':
              iconName = 'nutrition-outline';
              break;
            case 'ChatBot':
              iconName = 'chatbubble-ellipses-outline';
              break;
            case 'Descubre':
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
      <Tab.Screen name="Rutinas" component={Rutinas} />
      <Tab.Screen name="Alimentacion" component={Alimentacion} />
      <Tab.Screen name="ChatBot" component={ChatBot} />
      <Tab.Screen name="Descubre" component={Buscar} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
