const express = require('express');
const router = express.Router();
const usuarioCtl = require('../controller/users.controller.js');
//const firebaseAuth = require('../../middleware/firebaseAuth');

router.get('/', usuarioCtl.getUsu);

router.get('/buscar/:id_user', usuarioCtl.getUsuByCustomId);

router.post('/', usuarioCtl.createUsu);
router.get('/:id', usuarioCtl.getUsuById);
router.delete('/:id', usuarioCtl.deleteUsu);
router.put('/:id', usuarioCtl.updateUsu);

module.exports = router;