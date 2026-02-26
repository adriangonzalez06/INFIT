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

  const infopersonalizeddietRouter = require('./routes/infopersonalizeddiet');
  app.use('/api/infopersonalizeddiet', infopersonalizeddietRouter);

  const infogenericdietRouter = require('./routes/infogenericdiet');
  app.use('/api/infogenericdiet', infogenericdietRouter);

  const infomealsRouter = require('./routes/infomeals');
  app.use('/api/infomeals', infomealsRouter);

  const answerbotRouter = require('./routes/answerbot');
  app.use('/api/answerbot', answerbotRouter);

  const chatbotRouter = require('./routes/chatbot');
  app.use('/api/chatbot', chatbotRouter);

  const documentspdfRouter = require('./routes/documentspdf');
  app.use('/api/documentspdf', documentspdfRouter);

  const exercisesRouter = require('./routes/exercises');
  app.use('/api/exercises', exercisesRouter);

  const progressRouter = require('./routes/progress');
  app.use('/api/progress', progressRouter);

  const userspremiumRouter = require('./routes/userspremium');
  app.use('/api/userspremium', userspremiumRouter);

  const ingredientsRouter = require('./routes/ingredients');
  app.use('/api/ingredients', ingredientsRouter);

  console.log('✅ Todas las rutas cargadas correctamente');
} catch (e) {
  console.error('Error cargando routes/users.routes:', e);
}

module.exports = app;
