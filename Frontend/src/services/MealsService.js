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
        // Firestore usa "image", no "imgUrl"
        imgUrl: data.imgUrl || data.image || data.imagen || '',
        // Firestore usa "kcal", no "calories"
        calories: data.calories || data.kcal || 0,
        macronutrients: data.protein || data.proteins || data.proteina || 0,
        // ingredients es Array de strings en Firestore
        ingredients: Array.isArray(data.ingredients)
          ? data.ingredients
          : typeof data.ingredients === 'string'
            ? [data.ingredients]
            : [],
        vegetarian: data.vegetarian || false,
        vegan: data.vegan || false,
        // Firestore usa "gluten" (true = tiene gluten), gluten_free es lo contrario
        gluten_free: data.gluten_free !== undefined
          ? data.gluten_free
          : data.gluten === false,   // gluten:false → sin gluten → gluten_free:true
        description: data.description || '',
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

export default {
  getAllMeals,
  getMealById
};
