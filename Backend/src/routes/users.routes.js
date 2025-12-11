const express = require('express');
const usuarioCtl = require('../controller/users.controller.js'); // asegúrate que users.controller exporta con module.exports

const router = express.Router();

router.get('/GET', usuarioCtl.getUsu);
router.get('/buscar/:id_user', usuarioCtl.getUsuByCustomId);
router.post('/POST', usuarioCtl.createUsu);
router.get('/by:id', usuarioCtl.getUsuByEmail);
router.delete('/by:id', usuarioCtl.deleteUsu);
router.put('/by:id', usuarioCtl.updateUsu);

module.exports = router;
