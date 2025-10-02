const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');



//Configuracion

app.set('port', process.env.PORT || 8082);


//middlewares

app.use(cors());
app.use(express.json());

//rutas
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de IN-FIT');
});

// ruta para api de usuarios
app.use('/api/usuarios', require('./routes/users.routes'));
app.use('/api/freeusuarios', require('./routes/freeUsers'));
app.use('/api/premiumusuarios', require('./routes/userspremium'));

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;