const express = require('express');
const router = express.Router();
const routinesCtl = require('../controller/routines.controller.js');

// Obtener rutinas predefinidas — debe ir ANTES de /:userId para evitar conflictos
router.get('/predefined', routinesCtl.getPredefinedRoutines);

// Obtener todas las rutinas de un usuario
router.get('/:userId', routinesCtl.getUserRoutines);


// Crear una nueva rutina par un usuario
router.post('/:userId', routinesCtl.createRoutine);

// Obtener una rutina especifica
router.get('/:userId/:routineId', routinesCtl.getRoutineById);

// Actualizar una rutina
router.put('/:userId/:routineId', routinesCtl.updateRoutine);

// Eliminar una rutina
router.delete('/:userId/:routineId', routinesCtl.deleteRoutine);

module.exports = router;
