const infomealsCtl = {};
const firestoreService = require('../service/firestoreservice');

infomealsCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('infomeals');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

infomealsCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('infomeals', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

infomealsCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('infomeals', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

infomealsCtl.update = async (req, res) => {
    try {
        await firestoreService.update('infomeals', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

infomealsCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('infomeals', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = infomealsCtl;
