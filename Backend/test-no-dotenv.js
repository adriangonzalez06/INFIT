const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Test OK - sin dotenv');
});

const port = 3001;
console.log(`Iniciando servidor en puerto ${port}...`);

const server = app.listen(port, () => {
    console.log(`✅ Servidor escuchando en puerto ${port}`);
    console.log('Servidor está listo para recibir conexiones');
});

server.on('error', (err) => {
    console.error('❌ Error del servidor:', err.message);
});

process.on('exit', (code) => {
    console.log(`Proceso saliendo con código: ${code}`);
});
