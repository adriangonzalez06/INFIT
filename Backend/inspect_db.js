require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// --- 1. CONFIGURACIÓN Y CONEXIÓN (Reutilizando lógica de firestoreservice.js modificada para script) ---
const possiblePaths = [
    './in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json',
    './firebase-service-account.json',
    // Agrega otros paths si son necesarios
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
    console.error('❌ ERROR: No se encontró el archivo de credenciales Firebase en el directorio actual.');
    process.exit(1);
}

const serviceAccount = require(credentialPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// --- 2. LÓGICA DE INSPECCIÓN ---

async function inspectCollection(collectionName) {
    console.log(`\n--- INSPECCIONANDO COLECCIÓN: '${collectionName}' ---`);
    const snapshot = await db.collection(collectionName).limit(3).get(); // Solo 3 documentos de muestra

    if (snapshot.empty) {
        console.log(`[${collectionName}] está VACÍA.`);
        return;
    }

    console.log(`[${collectionName}] tiene documentos (mostrando muestra de ${snapshot.size}):`);

    snapshot.forEach(doc => {
        console.log(`\n  ID Documento: ${doc.id}`);
        const data = doc.data();
        const keys = Object.keys(data);
        console.log(`  Campos (${keys.length}):`, keys.join(', '));

        // Inspección profunda de tipos para detectar arrays/subcolecciones potenciales
        keys.forEach(key => {
            const val = data[key];
            if (Array.isArray(val)) {
                console.log(`    - ${key}: Array [Length: ${val.length}] (Ej: ${JSON.stringify(val.slice(0, 1))})`);
            } else if (typeof val === 'object' && val !== null && val.constructor.name === 'Object') {
                console.log(`    - ${key}: Object (Ej: ${JSON.stringify(val)})`);
            }
        });
    });

    // Intentar detectar subcolecciones comunes (esto no es exhaustivo pues Firestore no lista subcolecciones fácilmente via Admin SDK sin saber nombres, pero probaremos 'routines')
    // Nota: Listar subcolecciones es posible con listCollections() en el doc ref
    const sampleDoc = snapshot.docs[0];
    const subcollections = await sampleDoc.ref.listCollections();
    if (subcollections.length > 0) {
        console.log(`  \n  🔍 Subcolecciones detectadas en documento ${sampleDoc.id}:`);
        subcollections.forEach(sub => console.log(`    - ${sub.id}`));
    } else {
        console.log(`  \n  No se detectaron subcolecciones en la muestra.`);
    }
}

(async () => {
    try {
        console.log("Iniciando auditoría de la base de datos...\n");

        // Listar colecciones raíz
        const collections = await db.listCollections();
        const collectionNames = collections.map(c => c.id);

        console.log("Colecciones encontradas en la raíz:", collectionNames.join(', '), "\n");

        for (const name of collectionNames) {
            await inspectCollection(name);
        }

        console.log("\n✅ Auditoría finalizada.");
        process.exit(0);

    } catch (error) {
        console.error("Error fatal:", error);
        process.exit(1);
    }
})();
