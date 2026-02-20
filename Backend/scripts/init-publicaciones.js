/**
 * init-publicaciones.js
 *
 * Inicializa la colección 'publicaciones' en Firestore con datos de ejemplo.
 * ⚠️  Este script se elimina a sí mismo tras ejecutarse correctamente.
 *
 * Uso:
 *   cd Backend
 *   node scripts/init-publicaciones.js
 *
 * Requisitos:
 *   - El archivo de credenciales de Admin SDK debe existir en Backend/
 *   - npm install firebase-admin  (si no está instalado)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ── Inicialización ────────────────────────────────────────────────────────────
const serviceAccountPath = path.join(__dirname, '../in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ No se encontró el archivo de credenciales Admin SDK en:', serviceAccountPath);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

// ── Datos de ejemplo ──────────────────────────────────────────────────────────
const ahora = admin.firestore.Timestamp.now();
const hace1h = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60));
const hace2h = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 120));

const publicaciones = [
    {
        userId: 'sistema',
        username: 'INFIT Team',
        avatarUrl: null,
        titulo: '¡Bienvenido al feed de INFIT! 💪',
        contenido: 'Comparte tus progresos, rutinas favoritas y logros con toda la comunidad. ¡Aquí empieza tu historia fitness!',
        imageUrl: null,
        createdAt: ahora,
        likes: [],         // array de userIds que dieron like
        likesCount: 0,     // contador de likes (para eficiencia en queries)
        comentariosCount: 0,
    },
    {
        userId: 'sistema',
        username: 'INFIT Team',
        avatarUrl: null,
        titulo: 'Consejo del día: Hidratación 💧',
        contenido: 'Recuerda beber al menos 2 litros de agua al día, especialmente si entrenas. Una buena hidratación mejora el rendimiento y la recuperación muscular.',
        imageUrl: null,
        createdAt: hace1h,
        likes: [],
        likesCount: 0,
        comentariosCount: 0,
    },
    {
        userId: 'sistema',
        username: 'INFIT Team',
        avatarUrl: null,
        titulo: 'Reto semanal: 30 días de plancha 🏆',
        contenido: 'Únete al reto: empieza con 20 segundos de plancha y aumenta 5 segundos cada día. ¿Aceptas el desafío?',
        imageUrl: null,
        createdAt: hace2h,
        likes: [],
        likesCount: 0,
        comentariosCount: 0,
    },
];

// Comentario de ejemplo para el primer post
const comentarioEjemplo = {
    userId: 'sistema',
    username: 'INFIT Team',
    avatarUrl: null,
    texto: '¡Comparte tu primer progreso en los comentarios! 🎉',
    createdAt: ahora,
};

// ── Ejecución ─────────────────────────────────────────────────────────────────
async function init() {
    console.log('🚀 Inicializando colección "publicaciones"...\n');

    const colRef = db.collection('publicaciones');

    // Comprobar si ya existen documentos
    const existentes = await colRef.limit(1).get();
    if (!existentes.empty) {
        console.log('⚠️  La colección ya tiene documentos. No se sobreescribirán.');
        console.log('   Elimínalos manualmente en Firebase Console si quieres reiniciar.\n');
    } else {
        // Crear posts en batch
        const batch = db.batch();
        const postRefs = publicaciones.map(() => colRef.doc());

        publicaciones.forEach((post, i) => {
            batch.set(postRefs[i], post);
        });

        await batch.commit();
        console.log(`✅ ${publicaciones.length} publicaciones creadas.`);

        // Añadir comentario de ejemplo al primer post
        await postRefs[0].collection('comentarios').add(comentarioEjemplo);
        console.log('✅ Comentario de ejemplo añadido al primer post.\n');
    }

    // Mostrar resumen de la estructura creada
    console.log('📁 Estructura en Firestore:');
    console.log('   publicaciones/');
    console.log('     └── {postId}/');
    console.log('           ├── userId, username, avatarUrl');
    console.log('           ├── titulo, contenido, imageUrl');
    console.log('           ├── createdAt (Timestamp)');
    console.log('           ├── likes: []          ← array de userIds');
    console.log('           ├── likesCount: 0      ← contador');
    console.log('           ├── comentariosCount: 0');
    console.log('           └── comentarios/       ← subcolección');
    console.log('                 └── {comentarioId}/');
    console.log('                       ├── userId, username, avatarUrl');
    console.log('                       ├── texto');
    console.log('                       └── createdAt\n');

    console.log('🔥 Reglas de seguridad recomendadas para Firebase Console:');
    console.log('──────────────────────────────────────────────────────────');
    console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /publicaciones/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null
                    && (resource.data.userId == request.auth.uid
                        || request.resource.data.diff(resource.data).affectedKeys()
                           .hasOnly(['likes', 'likesCount', 'comentariosCount']));
      allow delete: if request.auth != null
                    && resource.data.userId == request.auth.uid;

      match /comentarios/{comentarioId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null
                      && request.resource.data.userId == request.auth.uid;
        allow delete: if request.auth != null
                      && resource.data.userId == request.auth.uid;
      }
    }
  }
}
  `);
    console.log('──────────────────────────────────────────────────────────\n');

    // ── Auto-eliminación ──────────────────────────────────────────────────────
    const selfPath = path.resolve(__filename);
    fs.unlink(selfPath, (err) => {
        if (err) {
            console.warn('⚠️  No se pudo eliminar el script automáticamente:', err.message);
            console.warn('   Elimínalo manualmente:', selfPath);
        } else {
            console.log('🗑️  Script eliminado automáticamente.\n');
        }
    });

    console.log('✅ Inicialización completa. Ya puedes usar la colección desde tu app.\n');
    process.exit(0);
}

init().catch((err) => {
    console.error('❌ Error durante la inicialización:', err);
    process.exit(1);
});
