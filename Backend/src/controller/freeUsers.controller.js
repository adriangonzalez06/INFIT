const freeusersCtl = {};
const firestoreService = require('../service/firestoreservice');

freeusersCtl.createFreeUsu = async (req, res) => {
    try {
        const { userID, ads_per_hour_gone } = req.body;
        
        if (!userID) {
            return res.status(400).json({ message: 'userID es requerido' });
        }

        const newFreeUser = {
            userID: userID,
            ads_per_hour_gone: ads_per_hour_gone || 6
        };

        const docId = await firestoreService.create('usersfree', newFreeUser);
        res.json({ message: 'Free User creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear Free User', error: error.message });
    }
}

freeusersCtl.getFreeUsu = async (req, res) => {
    try {
        const freeusers = await firestoreService.getAll('usersfree');
        res.json(freeusers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener Free Users', error: error.message });
    }
}

freeusersCtl.getFreeUserById = async (req, res) => {
    try {
        const freeuser = await firestoreService.getById('usersfree', req.params.id);
        res.json(freeuser);
    } catch (error) {
        res.status(404).json({ message: 'Free User no encontrado', error: error.message });
    }
}

freeusersCtl.deleteFreeUsu = async (req, res) => {
    try {
        await firestoreService.delete('usersfree', req.params.id);
        res.json({ message: 'Free User eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar Free User', error: error.message });
    }
}

freeusersCtl.updateFreeUsu = async (req, res) => {
    try {
        const { userID, ads_per_hour_gone } = req.body;
        const updateData = {};
        
        if (userID) updateData.userID = userID;
        if (ads_per_hour_gone !== undefined) updateData.ads_per_hour_gone = ads_per_hour_gone;

        await firestoreService.update('usersfree', req.params.id, updateData);
        res.json({ message: 'Free User actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar Free User', error: error.message });
    }
}

module.exports = {
    createFreeUsu: freeusersCtl.createFreeUsu,
    getFreeUsu: freeusersCtl.getFreeUsu,
    getFreeUserById: freeusersCtl.getFreeUserById,
    deleteFreeUsu: freeusersCtl.deleteFreeUsu,
    updateFreeUsu: freeusersCtl.updateFreeUsu
};