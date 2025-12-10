// firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Buscar el archivo de credenciales (puede tener diferentes nombres)
const possiblePaths = [
  path.join(__dirname, '../../in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json'),
  path.join(__dirname, '../../firebase-service-account.json'),
  path.join(__dirname, '../..', process.env.FIREBASE_CREDENTIALS_PATH || 'in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json')
];

let serviceAccountPath = null;
for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    serviceAccountPath = filePath;
    console.log(`✅ Credenciales encontradas en: ${path.basename(filePath)}`);
    break;
  }
}

if (!serviceAccountPath) {
  console.error('⚠️  ERROR: No se encontró el archivo de credenciales Firebase');
  console.error('Se espera uno de estos archivos:');
  possiblePaths.forEach(p => console.error(`  - ${p}`));
  console.error('\nAsegúrate de que el archivo in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json');
  console.error('esté en la carpeta Backend/ (raíz del backend)');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };