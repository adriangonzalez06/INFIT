import express from 'express';
import usuarioCtl from '../controller/users.controller.js'; // ESM: incluye .js

const router = express.Router();

router.get('/', usuarioCtl.getUsu);
router.get('/buscar/:id_user', usuarioCtl.getUsuByCustomId);
router.post('/usuarios', usuarioCtl.createUsu);
router.get('/:id', usuarioCtl.getUsuById);
router.delete('/:id', usuarioCtl.deleteUsu);
router.put('/:id', usuarioCtl.updateUsu);

export default router;
