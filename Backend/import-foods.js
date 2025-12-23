const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin SDK (instancia única)
const firestoreService = require('./src/service/firestoreservice.js');

async function importFoodData() {
  try {
    // Inicializar Firestore
    const db = firestoreService.initialize();
    console.log('✓ Conectado a Firestore');

    // Leer el archivo JSON
    const filePath = path.join(__dirname, 'FoodData_Central_foundation_food_json_2025-12-18.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const foodData = JSON.parse(rawData);

    console.log(`📊 Se encontraron ${foodData.length} alimentos para importar`);

    // Transformar datos al formato de Firestore
    const meals = foodData.map(food => ({
      name: food.nombre,
      kcal: food.calorias_kcal,
      macronutrients: {
        carbohydrates: food.carbohydrates_g,
        protein: food.protein_g,
        fat: food.fat_g,
        fiber: food.fiber_g,
      },
      ingredients: [food.nombre],
      vegan: true,
      vegetarian: true,
      gluten: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insertar en Firestore usando batch (máximo 500 operaciones)
    const batch = db.batch();
    const collectionRef = db.collection('ingredients');
    let batchCount = 0;
    let totalCount = 0;

    for (const meal of meals) {
      const docRef = collectionRef.doc();
      batch.set(docRef, meal);
      batchCount++;
      totalCount++;

      // Ejecutar batch cada 500 documentos
      if (batchCount === 500) {
        await batch.commit();
        console.log(`  ✓ ${totalCount} alimentos procesados...`);
        batchCount = 0;
      }
    }

    // Commit del batch final si hay documentos pendientes
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ ${totalCount} alimentos importados exitosamente a la colección 'ingredients'`);

    // Mostrar ejemplos
    console.log('\n📝 Ejemplos de datos importados:');
    meals.slice(0, 3).forEach((meal, index) => {
      console.log(`\n${index + 1}. ${meal.name}`);
      console.log(`   - Calorías: ${meal.kcal} kcal`);
      console.log(`   - Carbohidratos: ${meal.macronutrients.carbohydrates}g`);
      console.log(`   - Proteína: ${meal.macronutrients.protein}g`);
      console.log(`   - Grasa: ${meal.macronutrients.fat}g`);
    });

    console.log('\n✓ Importación completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    process.exit(1);
  }
}

importFoodData();
