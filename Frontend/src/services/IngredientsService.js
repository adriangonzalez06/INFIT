import Ingredient from '../objects/Ingredient';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from '../../firebaseConfig';

// Inicializar Firebase si no está ya inicializado
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// Obtener todos los ingredientes desde Firestore
export const getAllIngredients = async () => {
    try {
        console.log('📥 Iniciando carga de ingredientes desde Firestore...');
        
        const ingredientsCollection = collection(db, 'ingredients');
        console.log('🔗 Colección:', ingredientsCollection.path);
        
        const querySnapshot = await getDocs(ingredientsCollection);
        console.log('📦 QuerySnapshot obtenido, size:', querySnapshot.size);
        
        if (querySnapshot.empty) {
            console.warn('⚠️ No hay ingredientes en Firestore');
            return [];
        }
        
        const ingredients = [];
        let docCount = 0;
        
        querySnapshot.forEach((doc) => {
            docCount++;
            const data = doc.data();
            console.log(`📄 Procesando doc ${docCount}:`, doc.id, 'nombre:', data.name || data.nombre);
            
            const ingredient = new Ingredient(
                doc.id,
                data.name || data.nombre || '',
                data.calories || data.calorias_kcal || data.kcal || 0,
                data.fiber || data.fibra || 0,
                data.carbohydrates || data.carbs || data.carbohidratos || 0,
                data.fat || data.grasas || 0,
                data.protein || data.proteins || data.proteina || 0,
                data.imgUrl || null
            );
            ingredients.push(ingredient);
        });

        console.log('✅ Total de ingredientes cargados:', ingredients.length);
        return ingredients;
    } catch (error) {
        console.error('❌ Error cargando ingredientes de Firestore:', error);
        return [];
    }
};

// Buscar ingredientes por nombre
export const searchIngredients = async (query) => {
    try {
        console.log('📥 Buscando ingredientes en Firestore:', query);
        
        // Firestore no tiene búsqueda full-text nativa, así que cargamos todos y filtramos
        const ingredientsCollection = collection(db, 'ingredients');
        const allSnapshot = await getDocs(ingredientsCollection);
        
        const searchTerm = query.toLowerCase();
        const ingredients = [];
        
        allSnapshot.forEach((doc) => {
            const data = doc.data();
            if ((data.name || data.nombre || '').toLowerCase().includes(searchTerm)) {
                ingredients.push(
                    new Ingredient(
                        doc.id,
                        data.name || data.nombre || '',
                        data.calories || data.calorias_kcal || data.kcal || 0,
                        data.fiber || data.fibra || 0,
                        data.carbohydrates || data.carbs || data.carbohidratos || 0,
                        data.fat || data.grasas || 0,
                        data.protein || data.proteins || data.proteina || 0,
                        data.imgUrl || null
                    )
                );
            }
        });

        console.log('✅ Ingredientes encontrados en Firestore:', ingredients.length);
        return ingredients;
    } catch (error) {
        console.error('❌ Error buscando ingredientes:', error);
        return [];
    }
};
