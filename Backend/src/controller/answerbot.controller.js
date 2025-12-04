const answerbotCtl = {};
const firestoreService = require('../service/firestoreservice');

answerbotCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('answerbot');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

answerbotCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('answerbot', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

answerbotCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('answerbot', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

answerbotCtl.update = async (req, res) => {
    try {
        await firestoreService.update('answerbot', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

answerbotCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('answerbot', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = answerbotCtl;
