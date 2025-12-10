const express = require('express');
const router = express.Router();
const exercisesCtl = require('../controller/exercises.controller.js');

router.get('/', exercisesCtl.getExercises);

router.post('/', exercisesCtl.createExercise);

router.get('/:id', exercisesCtl.getExerciseById);

router.delete('/:id', exercisesCtl.deleteExercise);

router.put('/:id', exercisesCtl.updateExercise);

// Rutas de búsqueda por filtros
router.get('/buscar/grupo/:muscular_group', exercisesCtl.getExercisesByMuscularGroup);

router.get('/buscar/dificultad/:difficulty', exercisesCtl.getExercisesByDifficulty);

module.exports = router;
