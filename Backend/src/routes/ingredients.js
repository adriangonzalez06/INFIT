const express = require('express');
const router = express.Router();
const ingredientsCtl = require('../controller/ingredients.controller.js');

router.get('/', ingredientsCtl.getAll);
router.get('/search', ingredientsCtl.search);

module.exports = router;
