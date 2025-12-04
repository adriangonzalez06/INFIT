require('dotenv').config();

const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Test OK en puerto 3000');
});

const port = 3000;
const server = app.listen(port, () => {
    console.log(`Servidor de prueba en puerto ${port}`);
});

server.on('error', (err) => {
    console.error('Error:', err.message);
});
