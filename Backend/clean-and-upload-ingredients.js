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

async function cleanAndUploadIngredients() {
  try {
    console.log('🔄 Iniciando limpieza y recarga de ingredientes...\n');
    
    const ingredientsCollection = db.collection('ingredients');
    
    // Primero, verificar cuántos hay
    const existingDocs = await ingredientsCollection.get();
    console.log(`🗑️  Eliminando ${existingDocs.size} documentos existentes...`);
    
    // Eliminar todos los documentos existentes
    const batch = db.batch();
    let deleteCount = 0;
    
    existingDocs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
      
      if (deleteCount % 50 === 0) {
        console.log(`  - Marcados para eliminar: ${deleteCount}`);
      }
    });
    
    await batch.commit();
    console.log(`✅ ${deleteCount} documentos eliminados\n`);
    
    // Ahora subir nuevamente con los campos correctos
    console.log('📤 Subiendo ingredientes con todos los macronutrientes...\n');
    
    let uploadedCount = 0;
    let errorCount = 0;
    
    for (const food of foodData) {
      try {
        const ingredientDoc = {
          name: food.nombre,
          nombre: food.nombre,
          calories: food.calorias_kcal,
          fiber: food.fiber_g,
          carbohydrates: food.carbohydrates_g,
          fat: food.fat_g,
          protein: food.protein_g,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Usar el nombre como ID del documento
        const docId = food.nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
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

cleanAndUploadIngredients();
