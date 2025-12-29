const express = require('express');
const router = express.Router();
const infopersonalizeddietCtl = require('../controller/infopersonalizeddiet.controller.js');

router.post('/', infopersonalizeddietCtl.create);
router.get('/user/:userId', infopersonalizeddietCtl.getByUserId);
router.get('/', infopersonalizeddietCtl.getAll);
router.get('/:id', infopersonalizeddietCtl.getById);
router.put('/:id', infopersonalizeddietCtl.update);
router.delete('/:id', infopersonalizeddietCtl.delete);

module.exports = router;
