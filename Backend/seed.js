
require('dotenv').config();
const admin = require('firebase-admin');
const exercises = require('./import.json');

// Detectar credenciales de Firebase desde archivo de servicio
const credentialPath = process.env.FIREBASE_CREDENTIALS || './in-fit-945de-firebase-adminsdk-fbsvc-73060b4f8d.json';
const clearFirst = process.argv.includes('--clear'); // Agregar --clear para limpiar primero

try {
  const serviceAccount = require(credentialPath);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('❌ Error al cargar credenciales de Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

(async () => {
  try {
    // Limpiar colección si se especifica --clear
    if (clearFirst) {
      console.log('🗑️  Borrando ejercicios anteriores...');
      const snapshot = await db.collection('exercises').get();
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Colección limpiada');
    }

    console.log('📝 Iniciando importación de ejercicios...');
    
    const batch = db.batch();
    const colRef = db.collection('exercises');
    let count = 0;

    exercises.forEach((item, index) => {
      const docRef = colRef.doc((index + 1).toString());
      batch.set(docRef, item);
      count++;
    });

    await batch.commit();
    console.log(`✅ ${count} ejercicios importados correctamente a Firestore`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    process.exit(1);
  }
})();
