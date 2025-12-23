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

async function restoreMeals() {
  try {
    console.log('📥 Restaurando tus 20 platos originales...\n');

    // Leer el archivo meals-data.json
    const mealsFilePath = path.join(__dirname, 'meals-data.json');
    const mealsData = JSON.parse(fs.readFileSync(mealsFilePath, 'utf8'));

    const batch = db.batch();
    let mealCount = 0;

    for (const meal of mealsData) {
      // Convertir formato del archivo a formato Firestore
      const docRef = db.collection('infomeals').doc();
      batch.set(docRef, {
        name: meal.name,
        description: meal.description,
        kcal: meal.macronutrients.kcal,
        protein: meal.macronutrients.protein,
        carbohydrates: meal.macronutrients.carbohydrates,
        fat: meal.macronutrients.fat,
        fiber: meal.macronutrients.fiber,
        ingredients: meal.ingredients.map(i => i.name),
        vegan: meal.vegan,
        vegetarian: meal.vegetarian,
        gluten: meal.gluten,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Restaurando: ${meal.name}`);
      mealCount++;
    }

    await batch.commit();
    console.log(`\n✅ Se restauraron ${mealCount} platos exitosamente`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al restaurar platos:', error);
    process.exit(1);
  }
}

// Ejecutar
restoreMeals();
