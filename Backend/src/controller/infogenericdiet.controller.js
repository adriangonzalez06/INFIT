const infogenicdietCtl = {};
const firestoreService = require('../service/firestoreservice');

infogenicdietCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('infogenericdiet');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

infogenicdietCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('infogenericdiet', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

infogenicdietCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('infogenericdiet', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

infogenicdietCtl.update = async (req, res) => {
    try {
        await firestoreService.update('infogenericdiet', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

infogenicdietCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('infogenericdiet', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = infogenicdietCtl;
