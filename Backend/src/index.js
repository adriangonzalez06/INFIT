console.log('[BOOT] Ejecutando src/index.js - inicio');
require('dotenv').config();
const app = require('./app');
const firestoreService = require('./service/firestoreservice');
const os = require('os');

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
    const host = '0.0.0.0'; // aceptar conexiones desde emulador / LAN

    const server = app.listen(port, host, () => {
      const nets = os.networkInterfaces();
      let localIp = 'localhost';
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            localIp = net.address;
            break;
          }
        }
        if (localIp !== 'localhost') break;
      }
      console.log(`✅ Servidor escuchando en http://${localIp}:${port} (bind ${host})`);
      console.log(`   También disponible en http://localhost:${port} desde esta máquina`);
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