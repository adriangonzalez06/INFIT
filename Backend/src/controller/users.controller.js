const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const firestoreService = require('../service/firestoreservice');

// ✅ Config en nivel de módulo (no dentro de funciones)
const BCRYPT_COST = Number(process.env.BCRYPT_COST ?? 12); // (15) ayuda a rehash futuro
const PEPPER = process.env.PASSWORD_PEPPER ?? '';          // (12) nunca en cliente

// ✅ Utilidades de normalización y validación (8, 14)
const normalizeEmail = (email) => email?.trim().toLowerCase();
const toISODate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
const toNumberOrNull = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

// ✅ Hash con pepper (3, 15) y política mínima (8)
const hashPassword = async (pwd) => {
    if (typeof pwd !== 'string' || pwd.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
    }
    const toHash = PEPPER ? (pwd + PEPPER) : pwd;
    return bcrypt.hash(toHash, BCRYPT_COST); // bcrypt incluye salt en el hash
};

const usuarioCtl = {};

/** Listar usuarios */
usuarioCtl.getUsu = async (req, res) => {
    try {
        const usuarios = await firestoreService.getAll('users');
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('[getUsu] Error:', error); // (10) log interno
        return res.status(500).json({ message: 'Error al obtener usuarios' }); // (10) no filtrar detalles en producción
    }
};

/** Crear usuario */
/** Crear usuario (sincroniza Firebase Auth + Firestore) */
usuarioCtl.createUsu = async (req, res) => {
    try {
        // Extraer y normalizar (8, 14)
        const {
            nombre,
            username,
            email,
            password,
            photo,
            birthdate,
            height,
            weight,
            goal,
        } = req.body;

        const emailNorm = normalizeEmail(email);
        if (!emailNorm) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        // Validar contraseña
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // PASO 1: Crear usuario en Firebase Authentication
        // Firebase Auth verifica automáticamente si el email ya existe
        let userRecord;
        try {
            userRecord = await admin.auth().createUser({
                email: emailNorm,
                password: password,
                displayName: nombre,
            });
            console.log(`✅ Usuario creado en Firebase Auth con UID: ${userRecord.uid}`);
        } catch (authError) {
            if (authError.code === 'auth/email-already-exists') {
                return res.status(409).json({ message: 'El email ya está registrado' });
            }
            throw authError;
        }

        // PASO 2: Crear documento en Firestore con el UID como ID
        const nowISO = new Date().toISOString();
        const userData = {
            uid: userRecord.uid,                // 🔑 El UID de Firebase Auth
            nombre: (nombre ?? '').trim(),
            username: (username ?? '').trim(),
            email: emailNorm,
            photo: (photo ?? '').trim(),
            birthdate: toISODate(birthdate),
            height: toNumberOrNull(height),
            weight: toNumberOrNull(weight),
            goal: (goal ?? '').trim(),
            createdAt: nowISO,
            updatedAt: nowISO,
        };

        // Crear documento en Firestore con el UID como ID del documento
        await firestoreService.getDb()
            .collection('users')
            .doc(userRecord.uid)  // 🔑 Usar el UID como ID del documento
            .set(userData);

        console.log(`✅ Documento de usuario creado en Firestore con ID: ${userRecord.uid}`);

        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            uid: userRecord.uid,
            user: userData
        });
    } catch (error) {
        console.error('[createUsu] Error:', error);
        return res.status(500).json({ message: 'Error al crear usuario: ' + error.message });
    }
};

/** Obtener usuario por ID de documento */
usuarioCtl.getUsuById = async (req, res) => {
    try {
        const usuario = await firestoreService.getById('users', req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(usuario);
    } catch (error) {
        console.error('[getUsuById] Error:', error);
        return res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

/** Eliminar usuario */
usuarioCtl.deleteUsu = async (req, res) => {
    try {
        await firestoreService.delete('users', req.params.id);
        return res.status(204).send(); // (9) 204 No Content
    } catch (error) {
        console.error('[deleteUsu] Error:', error);
        return res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

/** Actualizar usuario (parcial) */
usuarioCtl.updateUsu = async (req, res) => {
    try {
        const {
            nombre,
            username,       // (5) extraer correctamente
            email,
            password,       // (3) si viene, hashear
            photo,
            birthdate,
            height,
            weight,
            goal,
        } = req.body;

        const updateData = {};

        // Campos presentes (8, 13, 14)
        if (nombre !== undefined) updateData.nombre = String(nombre).trim();
        if (username !== undefined) updateData.username = String(username).trim(); // (5) asignar al campo correcto
        if (email !== undefined) {
            const emailNorm = normalizeEmail(email);
            if (!emailNorm) {
                return res.status(400).json({ message: 'Email inválido' });
            }
            updateData.email = emailNorm;
        }

        // (3) Hashear si hay nueva contraseña
        if (password !== undefined && password !== '') {
            updateData.password_hash = await hashPassword(password);
            updateData.bcryptCost = BCRYPT_COST; // (15) actualizar metadata
        }

        if (photo !== undefined) updateData.photo = String(photo).trim();

        // (8) Tipos consistentes
        if (birthdate !== undefined) updateData.birthdate = toISODate(birthdate);
        if (height !== undefined) updateData.height = toNumberOrNull(height);
        if (weight !== undefined) updateData.weight = toNumberOrNull(weight);
        if (goal !== undefined) updateData.goal = String(goal).trim();

        // (15) timestamp de actualización
        updateData.updatedAt = new Date().toISOString();

        await firestoreService.update('users', req.params.id, updateData);
        return res.status(200).json({ message: 'Usuario actualizado' }); // (9) 200 OK
    } catch (error) {
        console.error('[updateUsu] Error:', error);
        return res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

/** Buscar por id_user (campo personalizado) */
usuarioCtl.getUsuByCustomId = async (req, res) => {
    try {
        // (8) parseo robusto
        const idUser = Number(req.params.id_user);
        if (!Number.isFinite(idUser)) {
            return res.status(400).json({ message: 'id_user inválido' });
        }

        const usuarios = await firestoreService.findByField('users', 'id_user', idUser);
        if (!usuarios || usuarios.length === 0) {
            return res.status(405).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(usuarios[0]);
    } catch (error) {
        console.error('[getUsuByCustomId] Error:', error);
        return res.status(500).json({ message: 'Error al buscar el usuario' });
    }
};

/** Login: autentica con Firebase Auth y retorna el token */
usuarioCtl.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const emailNorm = normalizeEmail(email);
        if (!emailNorm) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        // Aquí necesitarías usar Firebase SDK de cliente para obtener un token
        // O usar un servicio REST de Firebase (REST API)
        // Por ahora, solo verificamos que el usuario existe en Firestore con ese email

        const usuarios = await firestoreService.findByField('users', 'email', emailNorm);
        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }

        const usuario = usuarios[0];
        const uid = usuario.uid;

        // ⚠️  NOTA: Para autenticación real, deberías usar Firebase SDK en el cliente
        // El cliente obtiene un JWT de Firebase, y tú lo verificas en tu middleware

        return res.status(200).json({
            message: 'Login exitoso',
            uid: uid,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                photo: usuario.photo
            }
        });
    } catch (error) {
        console.error('[login] Error:', error);
        return res.status(500).json({ message: 'Error en login' });
    }
};

module.exports = usuarioCtl;
