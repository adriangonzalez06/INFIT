const {Router} = require('express');
const router = Router();

const  {createFreeUsu, getFreeUsu, getFreeUserById, deleteFreeUsu, updateFreeUsu} = require('../controller/freeUsers.controller.js');

router.get('/', getFreeUsu);
router.post('/', createFreeUsu);
router.get('/:id', getFreeUserById);
router.delete('/:id', deleteFreeUsu);
router.put('/:id', updateFreeUsu);

module.exports = router;