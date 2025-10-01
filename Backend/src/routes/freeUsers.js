const {Router} = require('express');
const router = Router();

const  {createFreeUsu, getFreeUsu, getFreeUsuById, deleteFreeUsu, updateFreeUsu} = require('../controller/freeUsers.controller.js');

router.route("/")

    .get(getFreeUsu)
    .post(createFreeUsu)

router.route('/:id')
    .get(getFreeUsuById)
    .delete(deleteFreeUsu)
    .put(updateFreeUsu)

module.exports = router;