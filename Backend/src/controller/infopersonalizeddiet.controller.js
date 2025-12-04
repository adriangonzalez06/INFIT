const infopersonalizeddietCtl = {};
const firestoreService = require('../service/firestoreservice');

infopersonalizeddietCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('infopersonalizeddiet');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

infopersonalizeddietCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('infopersonalizeddiet', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

infopersonalizeddietCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('infopersonalizeddiet', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

infopersonalizeddietCtl.update = async (req, res) => {
    try {
        await firestoreService.update('infopersonalizeddiet', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

infopersonalizeddietCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('infopersonalizeddiet', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = infopersonalizeddietCtl;
