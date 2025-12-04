require('dotenv').config();

console.log('Iniciando script...');

const express = require('express');
console.log('Express cargado');

const app = express();
console.log('App creada');

app.get('/', (req, res) => {
    console.log('Solicitud recibida');
    res.send('Test OK');
});

console.log('Rutas configuradas');

const port = 3000;
console.log(`Intentando escuchar en puerto ${port}...`);

const server = app.listen(port, () => {
    console.log(`✅ Servidor escuchando en puerto ${port}`);
});

server.on('error', (err) => {
    console.error('❌ Error del servidor:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Excepción no capturada:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});

console.log('Script completado, esperando conexiones...');
