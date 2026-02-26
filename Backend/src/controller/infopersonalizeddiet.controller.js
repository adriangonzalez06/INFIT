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
        
        // Validar que tenga los campos requeridos
        if (!newItem.name) {
            return res.status(400).json({ message: 'El nombre de la dieta es requerido' });
        }
        
        if (!newItem.userID) {
            return res.status(400).json({ message: 'El userID es requerido' });
        }

        console.log('📝 Inicio de guardado de dieta:', newItem.name);
        console.log('👤 UserID:', newItem.userID);

        // Asegurar que el documento del usuario existe (si no existe, crearlo)
        const userRef = firestoreService.getDb().collection('users').doc(newItem.userID);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log(`⚠️  Usuario ${newItem.userID} no existe. Creando documento...`);
            await userRef.set({
                createdAt: new Date().toISOString(),
                id: newItem.userID
            });
            console.log(`✅ Documento de usuario creado`);
        } else {
            console.log(`✅ Usuario ${newItem.userID} ya existe`);
        }

        // Preparar datos para Firestore - simplificado
        const dietData = {
            userID: newItem.userID,
            name: newItem.name,
            description: newItem.description || '',
            imgUrl: newItem.imgUrl || 'https://via.placeholder.com/300x300?text=Dieta+Personalizada',
            weeklyDishes: newItem.weeklyDishes || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('📋 Guardando dieta con datos:', {
            userID: dietData.userID,
            name: dietData.name,
            diasConPlatos: Object.keys(dietData.weeklyDishes).length
        });

        // Guardar en subcollección users/userId/infopersonalizeddiet
        const docId = await firestoreService.createSubcollection('users', newItem.userID, 'infopersonalizeddiet', dietData);
        
        console.log('✅ Dieta guardada exitosamente con ID:', docId);
        
        // Verificar que se guardó correctamente
        const savedDiet = await firestoreService.getSubcollectionDoc('users', newItem.userID, 'infopersonalizeddiet', docId);
        console.log('✅ Dieta verificada en Firestore - Confirmado guardado');
        
        res.json({ 
            message: 'Dieta personalizada creada correctamente', 
            id: docId,
            diet: savedDiet
        });
    } catch (error) {
        console.error('❌ Error al crear dieta:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            message: 'Error al crear dieta personalizada', 
            error: error.message,
            details: error.stack
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
