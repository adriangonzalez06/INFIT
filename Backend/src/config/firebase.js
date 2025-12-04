// firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Buscar el archivo de credenciales (puede tener diferentes nombres)
const possiblePaths = [
  path.join(__dirname, 'firebase-service-account.json'),
  path.join(__dirname, 'in-fit-945de-firebase-adminsdk-fbsvc-73060b4f8d.json')
];

let serviceAccountPath = null;
for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    serviceAccountPath = filePath;
    break;
  }
}

if (!serviceAccountPath) {
  console.error('⚠️  IMPORTANTE: No se encontró el archivo de credenciales Firebase');
  console.error('Se espera uno de estos archivos en la carpeta Backend/:');
  possiblePaths.forEach(p => console.error(`  - ${path.basename(p)}`));
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };