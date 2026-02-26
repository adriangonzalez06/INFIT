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

async function verifyIngredients() {
  try {
    console.log('🔍 Verificando ingredientes en Firestore...\n');
    
    const ingredientsCollection = db.collection('ingredients');
    const snapshot = await ingredientsCollection.get();
    
    console.log(`✅ Total de documentos en "ingredients": ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ La colección está vacía!');
      process.exit(1);
    }
    
    console.log('\n📄 Primeros 5 documentos:\n');
    
    let count = 0;
    snapshot.forEach((doc) => {
      if (count < 5) {
        const data = doc.data();
        console.log(`${count + 1}. ${doc.id}`);
        console.log(`   Nombre: ${data.name || data.nombre}`);
        console.log(`   Calorías: ${data.calories || data.calorias_kcal}`);
        console.log('');
        count++;
      }
    });
    
    // Verificar específicamente algunos ingredientes comunes
    console.log('🔎 Verificando ingredientes específicos:\n');
    
    const testIngredients = ['manzana', 'pollo', 'arroz_blanco'];
    
    for (const testName of testIngredients) {
      const docs = await ingredientsCollection
        .where('name', '==', testName)
        .limit(1)
        .get();
      
      if (!docs.empty) {
        const data = docs.docs[0].data();
        console.log(`✓ Encontrado: ${testName}`);
        console.log(`  Calorías: ${data.calories}`);
      } else {
        console.log(`✗ No encontrado: ${testName}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyIngredients();
