const progressCtl = {};
const firestoreService = require('../service/firestoreservice');

progressCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('progress');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

progressCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('progress', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

progressCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('progress', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

progressCtl.update = async (req, res) => {
    try {
        await firestoreService.update('progress', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

progressCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('progress', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = progressCtl;
