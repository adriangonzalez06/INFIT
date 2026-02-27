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

const chatbotService = require('../service/chatbotService');

chatbotCtl.create = async (req, res) => {
    try {
        const { message, userEmail } = req.body;

        // 1. Get AI response
        const botResponse = await chatbotService.getResponse(message);

        // 2. Save conversation to Firestore (optional but recommended)
        const chatData = {
            userEmail: userEmail || 'anonymous',
            userMessage: message,
            botResponse: botResponse,
            createdAt: new Date()
        };
        const docId = await firestoreService.create('chatbot_conversations', chatData);

        // 3. Return response to frontend
        res.json({
            id: docId,
            text: botResponse,
            from: 'bot'
        });
    } catch (error) {
        console.error('[chatbotCtl.create] Error:', error);
        res.status(500).json({ message: 'Error en el chatbot', error: error.message });
    }
}

chatbotCtl.ask = async (req, res) => {
    try {
        const { message } = req.body;
        const botResponse = await chatbotService.getResponse(message);
        res.json({ text: botResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error en el chatbot', error: error.message });
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
