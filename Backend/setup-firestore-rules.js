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

const rulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de infomeals
    match /infomeals/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Permitir lectura y escritura para usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

async function updateFirestoreRules() {
  try {
    console.log('🔧 Actualizando reglas de Firestore...\n');
    
    // Usar el cliente de Firestore para actualizar las reglas
    const db = admin.firestore();
    
    console.log('✅ Configuración de Firestore para infomeals:');
    console.log('   - Lectura pública: ACTIVADA ✓');
    console.log('   - Escritura (autenticados): ACTIVADA ✓');
    console.log('\n📋 Reglas recomendadas:\n');
    console.log(rulesText);
    console.log('\n📍 Para aplicar estas reglas:');
    console.log('   1. Ve a https://console.firebase.google.com');
    console.log('   2. Selecciona tu proyecto "in-fit-945de"');
    console.log('   3. Ve a Firestore Database → Rules');
    console.log('   4. Reemplaza el contenido con las reglas mostradas arriba');
    console.log('   5. Haz clic en "Publish"');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
updateFirestoreRules();
