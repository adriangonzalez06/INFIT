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

async function deleteAllMeals() {
  try {
    console.log('🗑️  Eliminando todos los platos de la colección infomeals...\n');

    const querySnapshot = await db.collection('infomeals').get();
    
    let deleteCount = 0;
    const batch = db.batch();

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
      console.log(`🗑️  Eliminando: ${doc.id}`);
    });

    await batch.commit();
    console.log(`\n✅ Se eliminaron ${deleteCount} platos exitosamente`);
    console.log('Los platos originales seguirán disponibles en Firestore');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al eliminar platos:', error);
    process.exit(1);
  }
}

// Ejecutar
deleteAllMeals();
