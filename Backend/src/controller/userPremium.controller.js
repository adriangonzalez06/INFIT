const userPremiumCtl = {};
const firestoreService = require('../service/firestoreservice');

userPremiumCtl.createUsu = async (req, res) => {
    try {
        const { userID, expiration_day, payment_method, auto_renew } = req.body;
        
        if (!userID) {
            return res.status(400).json({ message: 'userID es requerido' });
        }

        const newUserPremium = {
            userID: userID,
            expiration_day: expiration_day || null,
            payment_method: payment_method || '',
            auto_renew: auto_renew !== undefined ? auto_renew : true
        };

        const docId = await firestoreService.create('usersPremium', newUserPremium);
        res.json({ message: 'Usuario Premium creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear Usuario Premium', error: error.message });
    }
}

userPremiumCtl.getUsu = async (req, res) => {
    try {
        const usersPremium = await firestoreService.getAll('usersPremium');
        res.json(usersPremium);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener Usuarios Premium', error: error.message });
    }
}

userPremiumCtl.getUsuById = async (req, res) => {
    try {
        const userPremium = await firestoreService.getById('usersPremium', req.params.id);
        res.json(userPremium);
    } catch (error) {
        res.status(404).json({ message: 'Usuario Premium no encontrado', error: error.message });
    }
}

userPremiumCtl.deleteUsu = async (req, res) => {
    try {
        await firestoreService.delete('usersPremium', req.params.id);
        res.json({ message: 'Usuario Premium eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar Usuario Premium', error: error.message });
    }
}

userPremiumCtl.updateUsu = async (req, res) => {
    try {
        const { userID, expiration_day, payment_method, auto_renew } = req.body;
        const updateData = {};
        
        if (userID) updateData.userID = userID;
        if (expiration_day) updateData.expiration_day = expiration_day;
        if (payment_method) updateData.payment_method = payment_method;
        if (auto_renew !== undefined) updateData.auto_renew = auto_renew;

        await firestoreService.update('usersPremium', req.params.id, updateData);
        res.json({ message: 'Usuario Premium actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar Usuario Premium', error: error.message });
    }
}

module.exports = userPremiumCtl;