const express = require('express');
const router = express.Router();
const chatbotCtl = require('../controller/chatbot.controller.js');

router.get('/', chatbotCtl.getAll);
router.post('/', chatbotCtl.create);
router.get('/:id', chatbotCtl.getById);
router.put('/:id', chatbotCtl.update);
router.delete('/:id', chatbotCtl.delete);

module.exports = router;
