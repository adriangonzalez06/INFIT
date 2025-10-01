const mongoose = require('mongoose');

//cadena de conexion a la base de datos
const URI = process.env.MONGODB_URI 
    ? process.env.MONGODB_URI
    : 'mongodb://localhost/dbtest';

mongoose.connect(URI)

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('La base de datos se ha conectado exitosamente');
})