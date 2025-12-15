/**
 * Script para eliminar todos los usuarios de Firebase Authentication
 * Úsalo solo para limpiar la base de datos en desarrollo
 * 
 * Ejecuta: node clean-firebase-users.js
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Inicializar Firebase
const serviceAccountPath = path.join(__dirname, 'in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json');

try {
  if (!admin.apps.length) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (e) {
  console.error('Error al inicializar Firebase:', e.message);
  process.exit(1);
}

const auth = admin.auth();

async function deleteAllUsers() {
  console.log('🧹 Iniciando eliminación de usuarios de Firebase Authentication...\n');
  
  let deletedCount = 0;
  let page = 0;

  try {
    while (true) {
      // Obtener hasta 1000 usuarios por página
      const listUsersResult = await auth.listUsers(1000);
      
      if (listUsersResult.users.length === 0) {
        console.log('✅ No hay más usuarios por eliminar');
        break;
      }

      page++;
      console.log(`📄 Página ${page}: Encontrados ${listUsersResult.users.length} usuarios`);

      // Eliminar cada usuario
      for (const user of listUsersResult.users) {
        try {
          await auth.deleteUser(user.uid);
          deletedCount++;
          console.log(`  ✓ Eliminado: ${user.email} (${user.uid})`);
        } catch (error) {
          console.error(`  ✗ Error eliminando ${user.email}:`, error.message);
        }
      }

      // Si no hay más usuarios en la siguiente página, salir
      if (!listUsersResult.pageToken) {
        break;
      }
    }

    console.log(`\n✅ Listo! Se eliminaron ${deletedCount} usuarios de Firebase Authentication`);
    console.log('Ahora puedes registrarte con cualquier email nuevo sin problemas 🚀\n');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar
deleteAllUsers();
