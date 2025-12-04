const express = require('express');
const router = express.Router();
const progressCtl = require('../controller/progress.controller.js');

router.get('/', progressCtl.getAll);
router.post('/', progressCtl.create);
router.get('/:id', progressCtl.getById);
router.put('/:id', progressCtl.update);
router.delete('/:id', progressCtl.delete);

module.exports = router;
