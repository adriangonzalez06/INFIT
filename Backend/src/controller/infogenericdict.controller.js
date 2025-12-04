const infogenicdictCtl = {};
const firestoreService = require('../service/firestoreservice');

infogenicdictCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('infogenericdict');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

infogenicdictCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('infogenericdict', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

infogenicdictCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('infogenericdict', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

infogenicdictCtl.update = async (req, res) => {
    try {
        await firestoreService.update('infogenericdict', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

infogenicdictCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('infogenericdict', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = infogenicdictCtl;
