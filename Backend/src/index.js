require('dotenv').config();
const app = require('./app');
const firestoreService = require('./service/firestoreservice');

// Inicializar Firebase Firestore
firestoreService.initialize();

async function main() {
  try {
    // Verificar conexión a Firestore antes de iniciar
    const isConnected = await firestoreService.checkConnection();
    if (!isConnected) {
      console.error('❌ No se pudo conectar a Firestore. Revisa credenciales y .env');
      process.exit(1);
    }

    const port = app.get('port');
    const server = app.listen(port, () => {
      console.log(`✅ Servidor escuchando en http://localhost:${port}`);
    });

    server.on('error', (err) => {
      console.error('❌ Error en el servidor:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error.message || error);
    process.exit(1);
  }
}

main();