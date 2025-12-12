const express = require('express');
const usuarioCtl = require('../controller/users.controller.js'); // asegúrate que users.controller exporta con module.exports

const router = express.Router();

// Registro y Login (sin autenticación)
router.post('/register', usuarioCtl.createUsu);
router.post('/login', usuarioCtl.login);

// Obtener usuarios
router.get('/', usuarioCtl.getUsu);                    // GET /api/usuarios/
router.get('/:id', usuarioCtl.getUsuById);              // GET /api/usuarios/{uid}
router.get('/buscar/:id_user', usuarioCtl.getUsuByCustomId);  // GET /api/usuarios/buscar/{id_user}

// Actualizar y eliminar
router.put('/:id', usuarioCtl.updateUsu);              // PUT /api/usuarios/{uid}
router.delete('/:id', usuarioCtl.deleteUsu);           // DELETE /api/usuarios/{uid}

module.exports = router;
