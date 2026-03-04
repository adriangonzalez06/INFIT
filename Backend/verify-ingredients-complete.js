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

async function verifyIngredientsComplete() {
  try {
    console.log('🔍 Verificando ingredientes completos en Firestore...\n');
    
    const ingredientsCollection = db.collection('ingredients');
    const snapshot = await ingredientsCollection.limit(5).get();
    
    console.log('📄 Primeros 5 ingredientes con TODOS los macronutrientes:\n');
    
    let count = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      count++;
      console.log(`${count}. ${data.nombre || data.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Calorías: ${data.calories || 0} kcal`);
      console.log(`   Fibra: ${data.fiber || 0} g`);
      console.log(`   Carbohidratos: ${data.carbohydrates || 0} g`);
      console.log(`   Grasas: ${data.fat || 0} g`);
      console.log(`   Proteína: ${data.protein || 0} g`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyIngredientsComplete();
