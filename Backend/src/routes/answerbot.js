const express = require('express');
const router = express.Router();
const answerbotCtl = require('../controller/answerbot.controller.js');

router.get('/', answerbotCtl.getAll);
router.post('/', answerbotCtl.create);
router.get('/:id', answerbotCtl.getById);
router.put('/:id', answerbotCtl.update);
router.delete('/:id', answerbotCtl.delete);

module.exports = router;
