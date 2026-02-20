const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

//Configuracion

app.set('port', process.env.PORT || 8082);

//middlewares - CORS configurado explícitamente
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Log sencillo de todas las peticiones para depuración
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

//rutas
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API backend" });
});

// importa rutas
try {
  const usersRouter = require('./routes/users.routes');
  app.use('/api/usuarios', usersRouter);
  const freeusersRouter = require('./routes/freeUsers');
  app.use('/api/freeUsers', freeusersRouter);
  const exercisesRouter = require('./routes/exercises');
  app.use('/api/exercises', exercisesRouter);
  const routinesRouter = require('./routes/routines');
  app.use('/api/routines', routinesRouter);
  const cloudinaryRouter = require('./routes/cloudinary');
  app.use('/cloudinary', cloudinaryRouter);
} catch (e) {
  console.error('Error cargando routes/users.routes:', e);
}

module.exports = app;
