const express = require('express');
const usuarioCtl = require('../controller/users.controller.js');

const router = express.Router();

router.get('/GET', usuarioCtl.getUsu);
router.get('/buscar/email/:email', usuarioCtl.getUsuByEmail); // { changed code }
router.post('/POST', usuarioCtl.createUsu);
router.get('/:id', usuarioCtl.getUsuById);
router.delete('/by:id', usuarioCtl.deleteUsu);
router.put('/by:id', usuarioCtl.updateUsu);

module.exports = router;
