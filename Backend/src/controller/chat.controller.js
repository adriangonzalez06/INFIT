const { spawn } = require('child_process');
const path = require('path');

const chatController = {};

chatController.askAI = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'El mensaje es obligatorio' });
    }

    const pythonScriptPath = path.join(__dirname, '../../IA/chat_engine.py');
    const pythonExecutable = path.join(__dirname, '../../IA/venv/Scripts/python.exe');

    // Ejecutar el script de Python
    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, message]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Error de Python (exit code ${code}): ${error}`);
            return res.status(500).json({
                error: 'Error al procesar la consulta con IA',
                details: error
            });
        }

        res.json({ response: result.trim() });
    });
};

module.exports = chatController;
