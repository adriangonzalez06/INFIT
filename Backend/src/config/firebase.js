// firebase.js
console.log('[BOOT] Cargando src/config/firebase.js');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

function statInfo(p) {
  try {
    const s = fs.statSync(p);
    return { exists: true, isFile: s.isFile(), isDir: s.isDirectory() };
  } catch (e) {
    return { exists: false, isFile: false, isDir: false };
  }
}

function findServiceAccount() {
  console.log('══════════════════════════════════════════════');
  console.log('[firebase] → INICIO findServiceAccount()');
  console.log('[firebase] process.cwd()    =', process.cwd());
  console.log('[firebase] __dirname        =', __dirname);

  const rawEnvPath = process.env.SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('[firebase] rawEnvPath (.env)=', rawEnvPath);

  if (rawEnvPath) {
    const resolved = path.isAbsolute(rawEnvPath) ? rawEnvPath : path.resolve(process.cwd(), rawEnvPath);
    const info = statInfo(resolved);
    if (info.exists && info.isFile) {
      console.log('[firebase] ✅ Usando credencial desde .env:', resolved);
      return resolved;
    } else {
      console.warn('[firebase] ⚠ La ruta en .env no existe o no es archivo:', resolved);
    }
  } else {
    console.log('[firebase] No hay SERVICE_ACCOUNT_PATH/GOOGLE_APPLICATION_CREDENTIALS en .env.');
  }

  const candidatesDirs = [
    __dirname,                       // src/config
    path.resolve(__dirname, '..'),   // src
    path.resolve(__dirname, '..', '..') // Backend root
  ];
  console.log('[firebase] Escaneando directorios:', candidatesDirs);

  const patterns = [
    /in-fit-945de-firebase-adminsdk.*\.json$/i, // tu caso específico (nuevo y antiguo)
    /firebase-adminsdk.*\.json$/i,
    /service-?account.*\.json$/i,
    /firebase.*admin.*sdk.*\.json$/i
  ];

  // Buscar por patrones conocidos
  for (const dir of candidatesDirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.json')) continue;
        const full = path.join(dir, f);
        if (patterns.some(p => p.test(f))) {
          const info = statInfo(full);
          if (info.exists && info.isFile) {
            console.log('[firebase] ✅ Usando credencial encontrada por patrón:', full);
            return full;
          }
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Fallback: si sólo hay un .json en alguno de los directorios, usarlo
  for (const dir of candidatesDirs) {
    try {
      const jsons = fs.readdirSync(dir).filter(x => x.toLowerCase().endsWith('.json'));
      if (jsons.length === 1) {
        const full = path.join(dir, jsons[0]);
        console.log('[firebase] ⚠ Usando único .json encontrado como fallback:', full);
        return full;
      }
      if (jsons.length > 1) {
        console.log('[firebase] ⚠ Múltiples .json en', dir, '->', jsons);
      }
    } catch (e) { /* ignore */ }
  }

  // Mostrar qué .json se han encontrado para depuración
  let found = [];
  for (const dir of candidatesDirs) {
    try {
      const list = fs.readdirSync(dir).filter(x => x.toLowerCase().endsWith('.json')).map(x => path.join(dir, x));
      if (list.length) found = found.concat(list);
    } catch (e) { /* ignore */ }
  }
  console.warn('[firebase] ❌ No se encontró ninguna credencial válida. JSONs visibles:', found);
  return null;
}

// ===== BLOQUE DE TRAZAS: resolución de credencial =====
const serviceAccountPath = findServiceAccount();
console.log('[firebase] serviceAccountPath =', serviceAccountPath);

let serviceAccount = null;
if (!serviceAccountPath) {
  console.error('⚠️  IMPORTANTE: No se encontró archivo de credenciales Firebase.');
  console.error('  - Puedes crear en .env: SERVICE_ACCOUNT_PATH=C:\\ruta\\a\\tu-json.json');
  console.error('  - O copia/renombra el JSON a Backend\\firebase-service-account.json');
  // No forzamos process.exit para evitar crash inmediato; devolvemos stubs y dejamos que el proceso siga
  module.exports = { admin: null, db: null };
  return;
}

try {
  // preferimos require para que node haga el parseo, pero si falla usamos readFile
  try { serviceAccount = require(serviceAccountPath); }
  catch (rerr) {
    const content = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(content);
  }
} catch (err) {
  console.error('Error leyendo el JSON de credenciales:', err.message || err);
  module.exports = { admin: null, db: null };
  return;
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  console.log('[firebase] ✅ Firebase Admin inicializado correctamente.');
  module.exports = { admin, db };
} catch (err) {
  console.error('Error inicializando Firebase Admin:', err.message || err);
  module.exports = { admin: null, db: null };
}
