const routinesCtl = {};
const admin = require('firebase-admin');
const firestoreService = require('../service/firestoreservice');

/**
 * Obtener todas las rutinas de un usuario
 * Ruta: GET /api/routines/:userId
 */
routinesCtl.getUserRoutines = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const db = firestoreService.getDb();
        const routinesRef = db.collection('users').doc(userId).collection('routines');
        const snapshot = await routinesRef.get();

        const routines = [];
        snapshot.forEach(doc => {
            routines.push({ id: doc.id, ...doc.data() });
        });

        res.json(routines);
    } catch (error) {
        console.error('[getUserRoutines] Error:', error);
        res.status(500).json({ message: 'Error al obtener rutinas', error: error.message });
    }
};

/**
 * Crear una nueva rutina para un usuario
 * Ruta: POST /api/routines/:userId
 */
routinesCtl.createRoutine = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, day, exercises } = req.body; // exercises debería ser un array de IDs o objetos simples

        if (!userId) return res.status(400).json({ message: 'User ID is required' });
        if (!name) return res.status(400).json({ message: 'El nombre de la rutina es obligatorio' });

        const newRoutine = {
            name,
            day: day || '',
            exercises: Array.isArray(exercises) ? exercises : [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const db = firestoreService.getDb();
        const docRef = await db.collection('users').doc(userId).collection('routines').add(newRoutine);

        res.status(201).json({ message: 'Rutina creada con éxito', id: docRef.id, routine: newRoutine });
    } catch (error) {
        console.error('[createRoutine] Error:', error);
        res.status(500).json({ message: 'Error al crear la rutina', error: error.message });
    }
};

/**
 * Obtener una rutina específica
 * Ruta: GET /api/routines/:userId/:routineId
 */
routinesCtl.getRoutineById = async (req, res) => {
    try {
        const { userId, routineId } = req.params;
        if (!userId || !routineId) return res.status(400).json({ message: 'IDs son requeridos' });

        const db = firestoreService.getDb();
        const doc = await db.collection('users').doc(userId).collection('routines').doc(routineId).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Rutina no encontrada' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('[getRoutineById] Error:', error);
        res.status(500).json({ message: 'Error al obtener la rutina', error: error.message });
    }
};

/**
 * Actualizar una rutina
 * Ruta: PUT /api/routines/:userId/:routineId
 */
routinesCtl.updateRoutine = async (req, res) => {
    try {
        const { userId, routineId } = req.params;
        const { name, day, exercises } = req.body;

        if (!userId || !routineId) return res.status(400).json({ message: 'IDs son requeridos' });

        const updateData = { updatedAt: new Date() };
        if (name) updateData.name = name;
        if (day) updateData.day = day;
        if (exercises && Array.isArray(exercises)) updateData.exercises = exercises;

        const db = firestoreService.getDb();
        await db.collection('users').doc(userId).collection('routines').doc(routineId).set(updateData, { merge: true });

        res.json({ message: 'Rutina actualizada correctamente' });
    } catch (error) {
        console.error('[updateRoutine] Error:', error);
        res.status(500).json({ message: 'Error al actualizar la rutina', error: error.message });
    }
};

/**
 * Eliminar una rutina
 * Ruta: DELETE /api/routines/:userId/:routineId
 */
routinesCtl.deleteRoutine = async (req, res) => {
    try {
        const { userId, routineId } = req.params;
        if (!userId || !routineId) return res.status(400).json({ message: 'IDs son requeridos' });

        const db = firestoreService.getDb();
        await db.collection('users').doc(userId).collection('routines').doc(routineId).delete();

        res.json({ message: 'Rutina eliminada correctamente' });
    } catch (error) {
        console.error('[deleteRoutine] Error:', error);
        res.status(500).json({ message: 'Error al eliminar la rutina', error: error.message });
    }
};

/**
 * Obtener rutinas predefinidas (colección global, no por usuario)
 * Ruta: GET /api/routines/predefined
 */
routinesCtl.getPredefinedRoutines = async (req, res) => {
    try {
        const db = firestoreService.getDb();
        const snapshot = await db.collection('predefinedRoutines').get();

        const ORDER = ['piernas', 'espalda', 'pecho'];
        const routines = [];
        snapshot.forEach(doc => {
            routines.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar por orden establecido; los que no estén van al final
        routines.sort((a, b) => {
            const ia = ORDER.indexOf(a.id);
            const ib = ORDER.indexOf(b.id);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });

        res.json(routines);
    } catch (error) {
        console.error('[getPredefinedRoutines] Error:', error);
        res.status(500).json({ message: 'Error al obtener rutinas predefinidas', error: error.message });
    }
};

module.exports = routinesCtl;

