const express = require('express');
const router = express.Router();
const documentspdfCtl = require('../controller/documentspdf.controller.js');

router.get('/', documentspdfCtl.getAll);
router.post('/', documentspdfCtl.create);
router.get('/:id', documentspdfCtl.getById);
router.put('/:id', documentspdfCtl.update);
router.delete('/:id', documentspdfCtl.delete);

module.exports = router;
