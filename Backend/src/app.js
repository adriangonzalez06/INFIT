const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

//Configuracion
app.set("port", process.env.PORT || 8082);

//middlewares - CORS configurado explícitamente
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//rutas
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de IN-FIT");
});

// ruta para api de usuarios
app.use('/api/usuarios', require('./routes/users.routes'));
app.use('/api/usersfree', require('./routes/freeUsers'));
app.use('/api/premiumusuarios', require('./routes/userspremium'));

// ruta para api de ejercicios
app.use("/api/ejercicios", require("./routes/exercises"));

// rutas para otras colecciones
app.use('/api/answerbot', require('./routes/answerbot'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/documentspdf', require('./routes/documentspdf'));
app.use('/api/infomeals', require('./routes/infomeals'));
app.use('/api/infogenericdiet', require('./routes/infogenericdiet'));
app.use('/api/infopersonalizeddiet', require('./routes/infopersonalizeddiet'));
app.use('/api/progress', require('./routes/progress'));

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
