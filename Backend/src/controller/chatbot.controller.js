const chatbotCtl = {};
const firestoreService = require('../service/firestoreservice');

chatbotCtl.getAll = async (req, res) => {
    try {
        const items = await firestoreService.getAll('chatbot');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos', error: error.message });
    }
}

chatbotCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        const docId = await firestoreService.create('chatbot', newItem);
        res.json({ message: 'Documento creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear documento', error: error.message });
    }
}

chatbotCtl.getById = async (req, res) => {
    try {
        const item = await firestoreService.getById('chatbot', req.params.id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Documento no encontrado', error: error.message });
    }
}

chatbotCtl.update = async (req, res) => {
    try {
        await firestoreService.update('chatbot', req.params.id, req.body);
        res.json({ message: 'Documento actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar documento', error: error.message });
    }
}

chatbotCtl.delete = async (req, res) => {
    try {
        await firestoreService.delete('chatbot', req.params.id);
        res.json({ message: 'Documento eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar documento', error: error.message });
    }
}

module.exports = chatbotCtl;
