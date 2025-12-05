const express = require("express");
const cors = require("cors");
const path = require("path");
const YAML = require("yamljs");

const app = express();

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

// Log sencillo de todas las peticiones para depuración
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

//rutas
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API backend" });
});

// importa rutas (asegúrate de que los archivos de rutas usan module.exports)
try {
  const usersRouter = require('./routes/users.routes');
  app.use('/api/usuarios', usersRouter);
} catch (e) {
  // si no existen rutas todavía, no bloquear el arranque
}

module.exports = app;
