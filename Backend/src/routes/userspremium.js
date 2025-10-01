const {Router} = require('express');
const router = Router();

const  {createUsu, getUsu, getUsuById, deleteUsu, updateUsu} = require('../controller/userPremium.controller.js');

router.route("/")

    .get(getUsu)
    .post(createUsu)

router.route('/:id')
    .get(getUsuById)
    .delete(deleteUsu)
    .put(updateUsu)

module.exports = router;