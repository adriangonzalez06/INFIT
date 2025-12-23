const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin SDK (instancia única)
const firestoreService = require('./src/service/firestoreservice.js');

async function deleteAllInfomeals() {
  try {
    // Inicializar Firestore
    const db = firestoreService.initialize();
    console.log('✓ Conectado a Firestore');

    const collectionRef = db.collection('infomeals');
    
    // Obtener todos los documentos
    const snapshot = await collectionRef.get();
    console.log(`📊 Se encontraron ${snapshot.size} documentos en infomeals`);

    if (snapshot.size === 0) {
      console.log('✅ La colección infomeals ya está vacía');
      process.exit(0);
    }

    // Eliminar en batches de 500
    const batch = db.batch();
    let batchCount = 0;
    let totalCount = 0;

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      batchCount++;
      totalCount++;

      if (batchCount === 500) {
        batch.commit();
        console.log(`  ✓ ${totalCount} documentos eliminados...`);
        batchCount = 0;
      }
    });

    // Commit del batch final
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ ${totalCount} documentos eliminados de infomeals`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la eliminación:', error.message);
    process.exit(1);
  }
}

deleteAllInfomeals();
