const exercisesCtl = {};
const firestoreService = require('../service/firestoreservice');

exercisesCtl.getExercises = async (req, res) => {
    try {
        const exercises = await firestoreService.getAll('exercises');
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ejercicios', error: error.message });
    }
}

exercisesCtl.createExercise = async (req, res) => {
    try {
        const { name, difficulty, muscular_group, gif, image, repetitions, series, weight } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'El nombre del ejercicio es requerido' });
        }

        const newExercise = {
            name,
            difficulty: difficulty || '',
            muscular_group: muscular_group || '',
            gif: gif || '',
            image: image || '',
            repetitions: repetitions || 0,
            series: series || 0,
            weight: weight || 0
        };

        const docId = await firestoreService.create('exercises', newExercise);
        res.json({ message: 'Ejercicio creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear ejercicio', error: error.message });
    }
}

exercisesCtl.getExerciseById = async (req, res) => {
    try {
        const exercise = await firestoreService.getById('exercises', req.params.id);
        res.json(exercise);
    } catch (error) {
        res.status(404).json({ message: 'Ejercicio no encontrado', error: error.message });
    }
}

exercisesCtl.deleteExercise = async (req, res) => {
    try {
        await firestoreService.delete('exercises', req.params.id);
        res.json({ message: 'Ejercicio eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar ejercicio', error: error.message });
    }
}

exercisesCtl.updateExercise = async (req, res) => {
    try {
        const { name, difficulty, muscular_group, gif, image, repetitions, series, weight } = req.body;
        const updateData = {};
        
        if (name) updateData.name = name;
        if (difficulty) updateData.difficulty = difficulty;
        if (muscular_group) updateData.muscular_group = muscular_group;
        if (gif) updateData.gif = gif;
        if (image) updateData.image = image;
        if (repetitions !== undefined) updateData.repetitions = repetitions;
        if (series !== undefined) updateData.series = series;
        if (weight !== undefined) updateData.weight = weight;

        await firestoreService.update('exercises', req.params.id, updateData);
        res.json({ message: 'Ejercicio actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar ejercicio', error: error.message });
    }
}

// Obtener ejercicios por grupo muscular
exercisesCtl.getExercisesByMuscularGroup = async (req, res) => {
    try {
        const muscularGroup = req.params.muscular_group;
        const exercises = await firestoreService.findByField('exercises', 'muscular_group', muscularGroup);
        
        if (exercises.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ejercicios para ese grupo muscular' });
        }
        
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar ejercicios', error: error.message });
    }
}

// Obtener ejercicios por dificultad
exercisesCtl.getExercisesByDifficulty = async (req, res) => {
    try {
        const difficulty = req.params.difficulty;
        const exercises = await firestoreService.findByField('exercises', 'difficulty', difficulty);
        
        if (exercises.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ejercicios con esa dificultad' });
        }
        
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar ejercicios', error: error.message });
    }
}

module.exports = exercisesCtl;