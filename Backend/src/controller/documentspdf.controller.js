const documentspdfCtl = {};
const firestoreService = require('../service/firestoreservice');

documentspdfCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('documentspdf');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

documentspdfCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('documentspdf', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

documentspdfCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('documentspdf', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

documentspdfCtl.update = async (req, res) => {
    try {
        await firestoreService.update('documentspdf', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

documentspdfCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('documentspdf', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = documentspdfCtl;
