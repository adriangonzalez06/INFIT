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

// importa rutas (cada una con su propio try/catch para aislar errores)
const loadRoute = (path, mountAt) => {
  try {
    const router = require(path);
    app.use(mountAt, router);
    console.log(`✅ Ruta cargada: ${mountAt}`);
  } catch (e) {
    console.error(`❌ Error cargando ruta ${mountAt}:`, e.message);
  }
};

loadRoute('./routes/users.routes', '/api/usuarios');
loadRoute('./routes/freeUsers', '/api/freeUsers');
loadRoute('./routes/infopersonalizeddiet', '/api/infopersonalizeddiet');
loadRoute('./routes/infogenericdiet', '/api/infogenericdiet');
loadRoute('./routes/infomeals', '/api/infomeals');
loadRoute('./routes/answerbot', '/api/answerbot');
loadRoute('./routes/chatbot', '/api/chatbot');
loadRoute('./routes/documentspdf', '/api/documentspdf');
loadRoute('./routes/exercises', '/api/exercises');
loadRoute('./routes/routines', '/api/routines');
loadRoute('./routes/cloudinary', '/cloudinary');
loadRoute('./routes/progress', '/api/progress');
loadRoute('./routes/userspremium', '/api/userspremium');

// Cloudinary fuera del try/catch para que un fallo de otras rutas no lo tape
try {
  const cloudinaryRouter = require(path.join(__dirname, '../routes/cloudinary.routes'));
  app.use('/cloudinary', cloudinaryRouter);
  console.log('[app] ✅ Ruta /cloudinary/signature montada');
} catch (e) {
  console.error('[app] ❌ Error cargando cloudinary.routes:', e.message);
}

module.exports = app;
