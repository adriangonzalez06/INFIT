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

/**
 * Obtener dietas personalizadas de un usuario específico
 */
infopersonalizeddietCtl.getByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'userId es requerido' });
        }
        // Obtener dietas como subcolección del usuario
        const items = await firestoreService.getSubcollection('users', userId, 'infopersonalizeddiet');
        res.json(items || []);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener dietas del usuario', error: error.message });
    }
}

infopersonalizeddietCtl.create = async (req, res) => {
    try {
        const newItem = req.body;
        
        // Validar que tenga al menos los campos básicos
        if (!newItem.name) {
            return res.status(400).json({ message: 'El nombre de la dieta es requerido' });
        }
        
        if (!newItem.userID) {
            return res.status(400).json({ message: 'El userID es requerido' });
        }

        // Preparar datos para Firestore - asegurar que todos sean serializables
        const dietData = {
            name: newItem.name,
            description: newItem.description || '',
            // weeklyDishes se recibe como objeto con claves numéricas desde el frontend
            // Ej: {"0": [...], "1": [...], ...}
            weeklyDishes: newItem.weeklyDishes || {},
            // Usar imagen por defecto si no se proporciona
            imgUrl: newItem.imgUrl || 'https://via.placeholder.com/300x300?text=Dieta+Personalizada',
            type_diet: newItem.type_diet || 'personalizada',
            number_meals: newItem.number_meals || 5,
            // Campos opcionales si existen
            ...(newItem.ai_model && { ai_model: newItem.ai_model }),
            ...(newItem.carbohydrates && { carbohydrates: newItem.carbohydrates }),
            ...(newItem.proteins && { proteins: newItem.proteins }),
            ...(newItem.micronutrients && { micronutrient: newItem.micronutrients }),
            ...(newItem.personal_specifications && { personal_specifications: newItem.personal_specifications }),
            ...(newItem.vegetarian !== undefined && { vegetarian: newItem.vegetarian }),
            ...(newItem.vegan !== undefined && { vegan: newItem.vegan }),
        };

        console.log('📝 Guardando dieta personalizada:', dietData.name, 'para usuario:', newItem.userID);
        console.log('📋 Datos completos de la dieta:', JSON.stringify(dietData, null, 2));

        // Guardar en subcollección users/userId/infopersonalizeddiet
        const docId = await firestoreService.createSubcollection('users', newItem.userID, 'infopersonalizeddiet', dietData);
        
        console.log('✅ Dieta guardada exitosamente en subcollección con ID:', docId);
        
        // Verificar que se guardó correctamente leyendo el documento
        const savedDiet = await firestoreService.getSubcollectionDoc('users', newItem.userID, 'infopersonalizeddiet', docId);
        console.log('✅ Dieta verificada en Firestore:', JSON.stringify(savedDiet, null, 2));
        
        res.json({ 
            message: 'Dieta personalizada creada correctamente', 
            id: docId,
            diet: savedDiet
        });
    } catch (error) {
        console.error('❌ Error en crear dieta:', error);
        res.status(500).json({ 
            message: 'Error al crear dieta personalizada', 
            error: error.message,
            details: error.toString()
        });
    }
}

infopersonalizeddietCtl.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'userId es requerido como query parameter' });
        }
        
        // Obtener de la subcollección
        const item = await firestoreService.getSubcollectionDoc('users', userId, 'infopersonalizeddiet', id);
        res.json(item);
    } catch (error) {
        res.status(404).json({ message: 'Dieta no encontrada', error: error.message });
    }
}

infopersonalizeddietCtl.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'El userID es requerido en el body' });
        }
        
        const updateData = {
            ...req.body
        };
        // No incluir userId en la actualización
        delete updateData.userId;
        
        await firestoreService.updateSubcollection('users', userId, 'infopersonalizeddiet', id, updateData);
        res.json({ message: 'Dieta actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar dieta', error: error.message });
    }
}

infopersonalizeddietCtl.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'userId es requerido como query parameter' });
        }
        
        await firestoreService.deleteSubcollection('users', userId, 'infopersonalizeddiet', id);
        res.json({ message: 'Dieta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar dieta', error: error.message });
    }
}

module.exports = infopersonalizeddietCtl;
