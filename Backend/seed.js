require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Detectar credenciales de Firebase con prioridad a la versión nueva
const possiblePaths = [
  './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
  process.env.FIREBASE_CREDENTIALS || './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
  './firebase-service-account.json'
];

let credentialPath = null;
for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    credentialPath = filePath;
    console.log(`📄 Usando credenciales: ${path.basename(filePath)}`);
    break;
  }
}

if (!credentialPath) {
  console.error('❌ ERROR: No se encontró el archivo de credenciales Firebase');
  console.error('Se espera en la raíz de Backend/: in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json');
  process.exit(1);
}

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
      const batch = db.batch(); // Firestore batches have a limit of 500 ops
      let deleteCount = 0;

      const chunks = [];
      let tempBatch = db.batch();
      let opCount = 0;
      snapshot.docs.forEach((doc) => {
        tempBatch.delete(doc.ref);
        opCount++;
        if (opCount >= 450) {
          chunks.push(tempBatch);
          tempBatch = db.batch();
          opCount = 0;
        }
      });
      if (opCount > 0) chunks.push(tempBatch);

      for (const b of chunks) await b.commit();

      console.log('✅ Colección limpiada');
    }

    console.log('📝 Descargando ejercicios de yuhonas/free-exercise-db...');

    // Función helper para descargar JSON
    const https = require('https');
    const fetchJson = (url) => new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
        res.on('error', reject);
      }).on('error', reject);
    });

    const rawExercises = await fetchJson('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
    console.log(`📥 Descargados ${rawExercises.length} ejercicios.`);

    console.log('🔄 Transformando y guardando en Firestore...');

    // Mapeo de datos
    const exercisesToSave = rawExercises.map(ex => {
      // Mapear campos. 
      // API: name, level, category, images[], primaryMuscles[], instructions[]
      // Schema: name, muscular_group, difficulty, gif, image, repetitions, series, weight

      const image = (ex.images && ex.images.length > 0) ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[0]}` : '';

      return {
        name: ex.name,
        muscular_group: ex.primaryMuscles && ex.primaryMuscles.length > 0 ? ex.primaryMuscles[0] : (ex.category || 'General'),
        difficulty: ex.level || 'Intermedio',
        gif: '',
        image: image,
        instructions: ex.instructions ? ex.instructions.join('\n') : '',
        repetitions: 10, // Defecto
        series: 3,      // Defecto
        weight: '0'     // Defecto
      };
    });

    // Guardar en lotes de 400 (Firestore limit is 500)
    const chunkSize = 400;
    for (let i = 0; i < exercisesToSave.length; i += chunkSize) {
      const chunk = exercisesToSave.slice(i, i + chunkSize);
      const batch = db.batch();
      const colRef = db.collection('exercises');

      chunk.forEach((item) => {
        const docRef = colRef.doc();
        batch.set(docRef, item);
      });

      await batch.commit();
      console.log(`✅ Lote ${Math.floor(i / chunkSize) + 1} guardado (${chunk.length} items)`);
    }

    console.log(`✅ Total: ${exercisesToSave.length} ejercicios importados correctamente.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    process.exit(1);
  }
})();
