const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Inicializar Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Archivo de credenciales no encontrado:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://in-fit-945de.firebaseio.com'
});

const db = admin.firestore();

// Cargar los ingredientes del JSON
const foodDataPath = path.join(__dirname, 'FoodData_Central_foundation_food_json_2025-12-18.json');
const foodData = require(foodDataPath);

async function uploadIngredientsToFirestore() {
  try {
    console.log('🔄 Iniciando carga de ingredientes en Firestore...');
    
    const ingredientsCollection = db.collection('ingredients');
    
    let uploadedCount = 0;
    let errorCount = 0;
    
    for (const food of foodData) {
      try {
        const ingredientDoc = {
          nombre: food.nombre,
          name: food.nombre,
          calorias_kcal: food.calorias_kcal,
          calories: food.calorias_kcal,
          kcal: food.calorias_kcal,
          fiber_g: food.fiber_g,
          fiber: food.fiber_g,
          carbohydrates_g: food.carbohydrates_g,
          carbohydrates: food.carbohydrates_g,
          carbs: food.carbohydrates_g,
          carbohidratos: food.carbohydrates_g,
          fat_g: food.fat_g,
          fat: food.fat_g,
          grasas: food.fat_g,
          protein_g: food.protein_g,
          protein: food.protein_g,
          proteins: food.protein_g,
          proteina: food.protein_g,
          createdAt: new Date()
        };
        
        // Usar el nombre como ID del documento
        const docId = food.nombre.toLowerCase().replace(/\s+/g, '_');
        await ingredientsCollection.doc(docId).set(ingredientDoc);
        
        uploadedCount++;
        
        // Mostrar progreso cada 20 ingredientes
        if (uploadedCount % 20 === 0) {
          console.log(`✅ Cargados ${uploadedCount}/${foodData.length} ingredientes...`);
        }
      } catch (error) {
        console.error(`❌ Error cargando ingrediente "${food.nombre}":`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Carga completada:`);
    console.log(`   - Ingredientes cargados: ${uploadedCount}`);
    console.log(`   - Errores: ${errorCount}`);
    console.log(`   - Total del JSON: ${foodData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

uploadIngredientsToFirestore();
