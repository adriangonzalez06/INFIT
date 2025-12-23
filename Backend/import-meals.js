const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin SDK
const firestoreService = require('./src/service/firestoreservice.js');

async function importMealsToFirestore() {
  try {
    const db = firestoreService.initialize();
    console.log('✓ Conectado a Firestore');

    // Leer archivo JSON de platos
    const filePath = path.join(__dirname, 'meals-data.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const meals = JSON.parse(rawData);

    console.log(`📊 Se encontraron ${meals.length} platos para importar`);

    // Insertar en Firestore usando batch
    const batch = db.batch();
    const collectionRef = db.collection('infomeals');
    let batchCount = 0;
    let totalCount = 0;

    for (const meal of meals) {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        ...meal,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      batchCount++;
      totalCount++;

      // Firestore tiene límite de 500 operaciones por batch
      if (batchCount === 500) {
        await batch.commit();
        console.log(`  ✓ ${totalCount} platos procesados...`);
        batchCount = 0;
      }
    }

    // Commit del batch final si hay documentos pendientes
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ ${totalCount} platos importados exitosamente a la colección 'infomeals'`);

    // Mostrar ejemplos
    console.log('\n📝 Ejemplos de platos importados:');
    meals.slice(0, 3).forEach((meal, index) => {
      console.log(`\n${index + 1}. ${meal.name}`);
      console.log(`   - Calorías: ${meal.macronutrients.kcal} kcal`);
      console.log(`   - Proteína: ${meal.macronutrients.protein}g`);
      console.log(`   - Carbohidratos: ${meal.macronutrients.carbohydrates}g`);
      console.log(`   - Grasa: ${meal.macronutrients.fat}g`);
      console.log(`   - Fibra: ${meal.macronutrients.fiber}g`);
    });

    console.log('\n✓ Importación completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    process.exit(1);
  }
}

importMealsToFirestore();
