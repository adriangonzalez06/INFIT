const express = require('express');
const usuarioCtl = require('../controller/users.controller.js');

const router = express.Router();

router.get('/GET', usuarioCtl.getUsu);
router.get('/buscar/email/:email', usuarioCtl.getUsuByEmail);
router.post('/POST', usuarioCtl.createUsu);
router.get('/:id', usuarioCtl.getUsuById);
router.delete('/:id', usuarioCtl.deleteUsu);
router.put('/:id', usuarioCtl.updateUsu);

module.exports = router;
