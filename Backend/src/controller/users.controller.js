const usuarioCtl = {};
const firestoreService = require('../service/firestoreservice');

usuarioCtl.getUsu = async (req, res) => {
    try {
        const usuarios = await firestoreService.getAll('users');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
}

usuarioCtl.createUsu = async (req, res) => {
    try {
        const { nombre, email, password, photo, birthdate, height, weight, goal } = req.body;
        
        // Validar que email no exista
        const existingUsers = await firestoreService.findByField('users', 'email', email);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El email ya existe' });
        }

        const newUsuario = {
            nombre,
            email,
            password,
            photo: photo || '',
            birthdate: birthdate || null,
            height: height || 0,
            weight: weight || 0,
            goal: goal || ''
        };

        const docId = await firestoreService.create('users', newUsuario);
        res.json({ message: 'Usuario creado', id: docId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
}

usuarioCtl.getUsuById = async (req, res) => {
    try {
        const usuario = await firestoreService.getById('users', req.params.id);
        res.json(usuario);
    } catch (error) {
        res.status(404).json({ message: 'Usuario no encontrado', error: error.message });
    }
}

usuarioCtl.deleteUsu = async (req, res) => {
    try {
        await firestoreService.delete('users', req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
}

usuarioCtl.updateUsu = async (req, res) => {
    try {
        const { nombre, email, password, photo, birthdate, height, weight, goal } = req.body;
        const updateData = {};
        
        if (nombre) updateData.nombre = nombre;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (photo) updateData.photo = photo;
        if (birthdate) updateData.birthdate = birthdate;
        if (height) updateData.height = height;
        if (weight) updateData.weight = weight;
        if (goal) updateData.goal = goal;

        await firestoreService.update('users', req.params.id, updateData);
        res.json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
}

usuarioCtl.getUsuByCustomId = async (req, res) => {
    try {
        const idUser = parseInt(req.params.id_user);
        const usuarios = await firestoreService.findByField('users', 'id_user', idUser);
        
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.json(usuarios[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar el usuario', error: error.message });
    }
}

module.exports = usuarioCtl;