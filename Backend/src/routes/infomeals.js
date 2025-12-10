const express = require('express');
const router = express.Router();
const infomealsCtl = require('../controller/infomeals.controller.js');

router.get('/', infomealsCtl.getAll);
router.post('/', infomealsCtl.create);
router.get('/:id', infomealsCtl.getById);
router.put('/:id', infomealsCtl.update);
router.delete('/:id', infomealsCtl.delete);

module.exports = router;
