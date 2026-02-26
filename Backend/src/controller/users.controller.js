const bcrypt = require('bcrypt');
const admin = require('firebase-admin'); //Import para la fecha del servidor
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
usuarioCtl.createUsu = async (req, res) => {
    const { v4: uuidv4 } = require('uuid')
    try {
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
            streak,
        } = req.body;

        const emailNorm = normalizeEmail(email);
        if (!emailNorm) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
        }



        const userId = uuidv4(); // id determinístico basado en email

        // Obtener instancia de Firestore en runtime (prefiere servicio centralizado)
        let db = null;
        try {
            if (firestoreService && typeof firestoreService.getDb === 'function') {
                db = firestoreService.getDb();
            }
        } catch (e) {
            console.warn('[createUsu] firestoreService.getDb() falló:', e?.message || e);
        }
        if (!db || typeof db.batch !== 'function') {
            if (admin.apps && admin.apps.length > 0) {
                db = admin.firestore();
            } else {
                console.error('[createUsu] Firebase admin NO inicializado');
                return res.status(500).json({ message: 'Servicio de base de datos no disponible' });
            }
        }

        // Comprobación de unicidad: usa findByField si existe, si no, consulta directa
        let existingUsers = [];
        if (firestoreService && typeof firestoreService.findByField === 'function') {
            existingUsers = await firestoreService.findByField('users', 'email', emailNorm) || [];
        } else {
            const qSnap = await db.collection('users').where('email', '==', emailNorm).limit(1).get();
            if (!qSnap.empty) existingUsers = qSnap.docs.map(d => d.data());
        }
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'El email ya existe' });
        }

        const password_hash = await hashPassword(password);

        const birthdateISO = toISODate(birthdate);
        const heightNum = toNumberOrNull(height);
        const weightNum = toNumberOrNull(weight);

        const newUsuario = {
            nombre: (nombre ?? '').trim(),
            username: (username ?? '').trim(),
            email: emailNorm,
            password_hash,
            photo: (photo ?? '').trim(),
            birthdate: birthdateISO,
            height: heightNum,
            weight: weightNum,
            goal: (goal ?? '').trim(),
            streak: (streak ?? 0),
            bcryptCost: BCRYPT_COST,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const batch = db.batch();
        const userRef = db.collection('users').doc(userId);
        batch.set(userRef, newUsuario);

        const freeRef = db.collection('usersfree').doc(userId);
        batch.set(freeRef, {
            userId,
            ads_per_hour_gone: 10
        });

        console.log('[createUsu] Ejecutando batch.commit para userId=', userId);
        await batch.commit();
        console.log('[createUsu] batch.commit OK para userId=', userId);

        return res.status(201).json({ message: 'Usuario creado', id: userId }); // <-- usar userId
    } catch (error) {
        console.error('[createUsu] Error creando usuario:', error && (error.stack || error));
        if (error && (error.code === 'already-exists' || error.code === 6)) {
            return res.status(409).json({ message: 'El usuario ya existe' });
        }
        return res.status(500).json({ message: 'Error al crear usuario' });
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

/** Obtener usuario por ID de documento */
usuarioCtl.getUsuById = async (req, res) => {
    try {
        const { id } = req.params;
        let db = null;
        try { if (firestoreService && typeof firestoreService.getDb === 'function') db = firestoreService.getDb(); } catch (e) { }
        if (!db || typeof db.collection !== 'function') {
            if (admin.apps && admin.apps.length > 0) db = admin.firestore();
            else return res.status(500).json({ message: 'DB no disponible' });
        }
        const doc = await db.collection('users').doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: 'No encontrado' });
        return res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('[getUsuById] Error:', error && (error.stack || error));
        return res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

/** Buscar usuario por email */
usuarioCtl.getUsuByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const emailNorm = normalizeEmail(email);
        console.log('🔍 Buscando usuario con email:', email);
        console.log('📧 Email normalizado:', emailNorm);
        
        if (!emailNorm) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        let db = null;
        try { if (firestoreService && typeof firestoreService.getDb === 'function') db = firestoreService.getDb(); } catch (e) { }
        if (!db || typeof db.collection !== 'function') {
            if (admin.apps && admin.apps.length > 0) db = admin.firestore();
            else return res.status(500).json({ message: 'DB no disponible' });
        }

        const qSnap = await db.collection('users').where('email', '==', emailNorm).limit(1).get();
        
        if (qSnap.empty) {
            console.log('❌ Usuario no encontrado con email:', emailNorm);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const doc = qSnap.docs[0];
        const userData = { id: doc.id, ...doc.data() };
        
        console.log('✅ Usuario encontrado:');
        console.log('   ID del documento:', doc.id);
        console.log('   Email en BD:', userData.email);
        console.log('   Nombre:', userData.nombre);
        
        return res.status(200).json(userData);
    } catch (error) {
        console.error('[getUsuByEmail] Error:', error && (error.stack || error));
        return res.status(500).json({ message: 'Error al obtener usuario por email' });
    }
};

module.exports = usuarioCtl;
