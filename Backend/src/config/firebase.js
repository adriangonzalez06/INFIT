// firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

function findServiceAccount() {
  // 1) ruta desde .env
  const envPath = process.env.SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath) {
    const resolved = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
    if (fs.existsSync(resolved)) return resolved;
    console.warn(`La ruta en SERVICE_ACCOUNT_PATH no existe: ${resolved}`);
  }

  // 2) buscar en src/config y en la raíz Backend
  const candidatesDirs = [
    __dirname,                       // src/config
    path.resolve(__dirname, '..'),   // src
    path.resolve(__dirname, '..', '..') // Backend root
  ];

  const patterns = [/firebase-adminsdk.*\.json$/i, /service-?account.*\.json$/i, /firebase.*admin.*sdk.*\.json$/i];

  for (const dir of candidatesDirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        if (!f.toLowerCase().endsWith('.json')) continue;
        if (patterns.some(p => p.test(f)) || /firebase-adminsdk/i.test(f)) return full;
      }
    } catch (e) {
      // ignore
    }
  }

  return null;
}

const serviceAccountPath = findServiceAccount();

if (!serviceAccountPath) {
  console.error('⚠️  IMPORTANTE: No se encontró el archivo de credenciales Firebase');
  console.error('Se espera uno de estos archivos en la carpeta Backend/ o configura SERVICE_ACCOUNT_PATH en .env');
  console.error('  - in-fit-...-firebase-adminsdk-*.json');
  console.error('  - firebase-service-account.json');
  process.exit(1);
}

let serviceAccount;
try {
  // usar require si la ruta es absoluta o relativa al proyecto
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  try {
    const content = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(content);
  } catch (e) {
    console.error('Error leyendo el JSON de credenciales:', e.message || e);
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };