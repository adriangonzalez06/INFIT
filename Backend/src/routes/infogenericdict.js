const express = require('express');
const router = express.Router();
const infogenericdictCtl = require('../controller/infogenericdict.controller.js');

router.get('/', infogenericdictCtl.getAll);
router.post('/', infogenericdictCtl.create);
router.get('/:id', infogenericdictCtl.getById);
router.put('/:id', infogenericdictCtl.update);
router.delete('/:id', infogenericdictCtl.delete);

module.exports = router;
