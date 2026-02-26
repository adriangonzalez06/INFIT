// Frontend Firestore Service para obtener platos (infomeals)
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../../firebaseConfig';

// Inicializar Firebase si no está ya inicializado
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

/**
 * Obtener todos los platos de la colección infomeals
 * @returns {Promise<Array>} Array de platos con estructura Dish
 */
export const getAllMeals = async () => {
  try {
    console.log('📥 Intentando obtener platos de Firestore...');
    const mealsCollection = collection(db, 'infomeals');
    const querySnapshot = await getDocs(mealsCollection);
    
    const meals = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      meals.push({
        id: doc.id,
        name: data.name || data.nombre || '',
        imgUrl: data.imgUrl || data.image || data.imagen || '',
        kcal: data.kcal || data.calories || 0,
        calories: data.kcal || data.calories || 0,
        fiber: data.fiber || data.fibra || 0,
        carbs: data.carbs || data.carbohydrates || data.carbohidratos || 0,
        fat: data.fat || data.grasas || 0,
        protein: data.protein || data.proteins || data.proteina || 0,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : 
                    typeof data.ingredients === 'string' ? [data.ingredients] : [],
        vegetarian: data.vegetarian || false,
        vegan: data.vegan || false,
        gluten_free: data.gluten_free || data.gluten === false || false,
        ...data
      });
    });
    
    console.log('✅ Platos obtenidos de Firestore:', meals.length);
    return meals;
  } catch (error) {
    console.error('❌ Error obteniendo platos de Firestore:', error);
    console.log('⚠️  Usando platos de fallback');
    return getDefaultMeals();
  }
};

/**
 * Obtener solo los platos creados por un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de platos creados por ese usuario
 */
export const getUserMeals = async (userId) => {
  try {
    if (!userId) {
      console.warn('⚠️ No se proporcionó userId para obtener platos del usuario');
      return [];
    }
    
    console.log(`📥 Intentando obtener platos del usuario ${userId}...`);
    const mealsCollection = collection(db, 'infomeals');
    const querySnapshot = await getDocs(mealsCollection);
    
    const userMeals = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar solo los platos creados por este usuario
      if (data.createdBy === userId) {
        userMeals.push({
          id: doc.id,
          name: data.name || data.nombre || '',
          imgUrl: data.imgUrl || data.image || data.imagen || '',
          kcal: data.kcal || data.calories || 0,
          calories: data.kcal || data.calories || 0,
          fiber: data.fiber || data.fibra || 0,
          carbs: data.carbs || data.carbohydrates || data.carbohidratos || 0,
          fat: data.fat || data.grasas || 0,
          protein: data.protein || data.proteins || data.proteina || 0,
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : 
                      typeof data.ingredients === 'string' ? [data.ingredients] : [],
          vegetarian: data.vegetarian || false,
          vegan: data.vegan || false,
          gluten_free: data.gluten_free || data.gluten === false || false,
          createdBy: data.createdBy,
          ...data
        });
      }
    });
    
    console.log(`✅ Platos del usuario obtenidos: ${userMeals.length}`);
    return userMeals;
  } catch (error) {
    console.error('❌ Error obteniendo platos del usuario:', error);
    return [];
  }
};

/**
 * Platos de fallback en caso de error con Firestore
 */
const getDefaultMeals = () => {
  return [
    {
      id: 1,
      name: "Plato 1",
      imgUrl: '',
      calories: 300,
      macronutrients: 20,
      ingredients: ["Ingrediente 1"],
      vegetarian: false,
      vegan: false,
      gluten_free: true
    }
  ];
};

/**
 * Obtener un plato específico por ID
 * @param {string} mealId - ID del plato
 * @returns {Promise<Object|null>} Objeto del plato o null si no existe
 */
export const getMealById = async (mealId) => {
  try {
    const mealsCollection = collection(db, 'infomeals');
    const querySnapshot = await getDocs(mealsCollection);
    
    let meal = null;
    querySnapshot.forEach((doc) => {
      if (doc.id === mealId) {
        const data = doc.data();
        meal = {
          id: doc.id,
          name: data.name || data.nombre || '',
          imgUrl: data.imgUrl || data.image || data.imagen || '',
          calories: data.kcal || data.calories || 0,
          macronutrients: data.protein || data.proteins || data.proteina || 0,
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : 
                      typeof data.ingredients === 'string' ? [data.ingredients] : [],
          vegetarian: data.vegetarian || false,
          vegan: data.vegan || false,
          gluten_free: data.gluten_free || data.gluten === false || false,
          ...data
        };
      }
    });
    
    return meal;
  } catch (error) {
    console.error('❌ Error obteniendo plato de Firestore:', error);
    return null;
  }
};

/**
 * Guardar un nuevo plato a través del API backend
 * @param {Object} mealData - Datos del plato a guardar
 * @returns {Promise<Object>} Respuesta del servidor con el ID del plato guardado
 */
export const saveMeal = async (mealData) => {
  try {
    console.log('📨 Guardando plato en el backend:', mealData.name);
    
    // Usar 10.0.2.2 para emulador Android, localhost para otros
    const host = '10.0.2.2'; // Android emulator, cambiar a localhost en web o a IP en dispositivo real
    const port = '8082';
    const url = `http://${host}:${port}/api/infomeals`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealData),
    });

    if (!response.ok) {
      let errorMessage = 'Error al guardar el plato';
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData.details || errorData.error || '';
      } catch (e) {
        errorMessage = `Error HTTP ${response.status}`;
      }
      console.error('❌ Error response:', errorMessage, errorDetails);
      throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
    }

    const result = await response.json();
    console.log('✅ Plato guardado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error guardando plato:', error);
    throw error;
  }
};

export default {
  getAllMeals,
  getMealById,
  saveMeal,
  getUserMeals
};
