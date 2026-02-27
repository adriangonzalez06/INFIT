const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * ChatbotService handles the logic for generating AI-like responses.
 * Enhanced v2.2: Includes PDF Knowledge Base for exercises and diets.
 */
class ChatbotService {
    constructor() {
        this.knowledgeBaseDir = path.join(__dirname, '../../IA');
        this.manualPath = path.join(this.knowledgeBaseDir, 'Spider-Man.txt');
        this.pdfDir = path.join(this.knowledgeBaseDir, 'IA pdfs');

        this.greetings = [
            "¡Hola! Soy tu coach de INFIT. ¿En qué puedo ayudarte hoy?",
            "¡Qué tal! Aquí tu asistente de INFIT listo para la acción. ¿Qué tienes en mente?",
            "¡Hola, hola! ¿Listo para mejorar tu salud hoy? Pregúntame sobre dietas o ejercicios.",
            "¡Saludos! Soy tu compañero de entrenamiento virtual. ¿Cómo va ese progreso?"
        ];

        this.fallbacks = [
            "Esa es una pregunta interesante. Según mis datos, lo más importante es la constancia. ¿Te gustaría saber algo más específico sobre nutrición?",
            "No estoy 100% seguro de esa respuesta, pero puedo decirte que una dieta equilibrada es la base de todo. ¿Hablamos de algún grupo muscular?",
            "Umm, sigo aprendiendo sobre eso. Pero si buscas mejorar tu rendimiento, recuerda hidratarte bien o preguntarme por rutinas específicas.",
            "Como tu asistente de INFIT, te sugiero que consultes con un profesional para temas médicos profundos, pero aquí tengo mucha info sobre rutinas y dietas. ¿Qué prefieres ver?"
        ];

        // Keyword to PDF mapping (Exercise)
        this.exerciseMaps = {
            'musculacion': 'ejercicios/Enciclopedia de ejercicios de musculacion.pdf',
            'pesos': 'ejercicios/Enciclopedia de ejercicios de musculacion.pdf',
            'gym': 'ejercicios/Enciclopedia de ejercicios de musculacion.pdf',
            'gimnasio': 'ejercicios/Enciclopedia de ejercicios de musculacion.pdf',
            'calistenia': 'ejercicios/calistenia.pdf',
            'barras': 'ejercicios/calistenia.pdf',
            'crossfit': 'ejercicios/croosfit-guia.pdf',
            'funcional': 'ejercicios/croosfit-guia.pdf',
            'mayores': 'ejercicios/GUÍA DE EJERCICIO FÍSICO PARA MAYORES.pdf',
            'adultos': 'ejercicios/GUÍA DE EJERCICIO FÍSICO PARA MAYORES.pdf',
            'ancianos': 'ejercicios/abuelos.pdf',
            'abuelos': 'ejercicios/abuelos.pdf',
            'press': 'ejercicios/GGS-eBook_Guia-Tecnica-de-Press-Squat-Deadlift.pdf',
            'banca': 'ejercicios/GGS-eBook_Guia-Tecnica-de-Press-Squat-Deadlift.pdf',
            'pecho': 'ejercicios/GGS-eBook_Guia-Tecnica-de-Press-Squat-Deadlift.pdf',
            'sentadilla': 'ejercicios/GGS-eBook_Guia-Tecnica-de-Press-Squat-Deadlift.pdf',
            'pierna': 'ejercicios/GGS-eBook_Guia-Tecnica-de-Press-Squat-Deadlift.pdf',
            'avanzado': 'ejercicios/guia-entrenamiento-avanzado.pdf',
            'fuerza': 'ejercicios/TEXTO-Musculacion-Entrenamiento-Peronalizado.pdf'
        };

        // Keyword to PDF mapping (Diet)
        this.dietMaps = {
            'adelgazar': 'dietas/458-2013-08-18-cap-22-dietas-adelgazamiento.pdf',
            'perder peso': 'dietas/458-2013-08-18-cap-22-dietas-adelgazamiento.pdf',
            'grasa': 'dietas/458-2013-08-18-cap-22-dietas-adelgazamiento.pdf',
            'blanda': 'dietas/CGD- DIETA BLANDA.pdf',
            'estomago': 'dietas/CGD- DIETA BLANDA.pdf',
            'sobrepeso': 'dietas/dieta_sobrepeso.pdf',
            'obeso': 'dietas/dieta_sobrepeso.pdf',
            '1500': 'dietas/dieta_1500_kcal.pdf',
            'calorias': 'dietas/dieta_1500_kcal.pdf',
            'menu': 'dietas/menus_montero_ALVIMED_2020.pdf',
            'comida': 'dietas/menus_montero_ALVIMED_2020.pdf',
            'receta': 'dietas/menus_montero_ALVIMED_2020.pdf',
            'keto': 'dietas/ManualDietasC.pdf',
            'proteina': 'dietas/ManualDietasC.pdf',
            'ayuno': 'dietas/ManualDietasC.pdf'
        };
    }

    async getResponse(userMessage) {
        const query = userMessage.toLowerCase();

        // 1. Greetings
        if (this.isGreeting(query)) {
            return this.getRandom(this.greetings);
        }

        // 2. Search in Exercise PDFs
        for (const [key, pdfPath] of Object.entries(this.exerciseMaps)) {
            if (query.includes(key)) {
                return await this.searchInPdf(pdfPath, key, "ejercicios");
            }
        }

        // 3. Search in Diet PDFs
        for (const [key, pdfPath] of Object.entries(this.dietMaps)) {
            if (query.includes(key)) {
                return await this.searchInPdf(pdfPath, key, "dietas");
            }
        }

        // 4. Fallback to Nutrition Manual (txt)
        try {
            // Clean query for manual search (take most significant words)
            const cleanedQuery = this.getCleanQuery(query);
            const manualMatch = await this.searchManual(cleanedQuery);
            if (manualMatch) return manualMatch;
        } catch (err) {
            console.error('[ChatbotService] Error searching manual:', err);
        }

        // 5. Random Fallback
        return this.getRandom(this.fallbacks);
    }

    isGreeting(query) {
        const words = ['hola', 'buenos días', 'buenas tardes', 'hey', 'hi', 'que tal', 'quien eres', 'v2.1', 'v2.2'];
        return words.some(w => query.includes(w));
    }

    getCleanQuery(query) {
        const stopWords = ['hola', 'como', 'quiero', 'necesito', 'dime', 'sobre', 'para', 'el', 'la', 'un', 'una', 'qué', 'que', 'en', 'de'];
        const words = query.split(' ').filter(w => !stopWords.includes(w) && w.length > 2);
        return words.length > 0 ? words[0] : query; // Use first significant word
    }

    getRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    async searchManual(query) {
        if (!fs.existsSync(this.manualPath)) return null;
        console.log(`[ChatbotService] Searching Manual for: ${query}`);
        const content = fs.readFileSync(this.manualPath, 'utf-8');

        // Split by double newline to get paragraphs/blocks
        const blocks = content.split('\n\n');
        const matches = blocks.filter(block =>
            block.toLowerCase().includes(query) && block.length > 60
        );

        if (matches.length > 0) {
            let match = this.getRandom(matches).trim().replace(/\s+/g, ' ');
            if (match.length > 500) match = match.substring(0, 500) + "...";
            return match;
        }
        return null;
    }

    async searchInPdf(relativePath, query, type) {
        const fullPath = path.join(this.pdfDir, relativePath);
        if (!fs.existsSync(fullPath)) return `He encontrado una referencia a ${relativePath}, pero no puedo abrir el archivo ahora mismo.`;

        try {
            console.log(`[ChatbotService] Reading PDF: ${relativePath} for query: ${query}`);
            const dataBuffer = fs.readFileSync(fullPath);
            const data = await pdf(dataBuffer);

            // Improved search: split into paragraphs or larger blocks, not just single lines
            const blocks = data.text.split('\n\n');
            const matches = blocks.filter(b => b.toLowerCase().includes(query) && b.length > 40);

            if (matches.length > 0) {
                let snip = matches[0].trim().replace(/\s+/g, ' ');
                if (snip.length > 400) snip = snip.substring(0, 400) + "...";
                return `${snip}\n\n¿Te sirve esta información o buscabas algo más específico?`;
            } else {
                // Try a second pass with simpler line-based if blocks didn't work
                const lines = data.text.split('\n');
                const lineMatches = lines.filter(l => l.toLowerCase().includes(query) && l.trim().length > 30);
                if (lineMatches.length > 0) {
                    const snip = lineMatches[0].trim();
                    return `${snip}\n\n¿Quieres profundizar más sobre este tema?`;
                }
                return `He estado buscando sobre "${query}", pero no encuentro un detalle exacto. ¿Podrías darme más pistas?`;
            }
        } catch (error) {
            console.error(`Error parsing PDF ${relativePath}:`, error);
            return `Tengo un manual sobre ${query} (${path.basename(relativePath)}), pero ha habido un error al intentar leerlo. ¡Seguimos trabajando en ello!`;
        }
    }
}

module.exports = new ChatbotService();
