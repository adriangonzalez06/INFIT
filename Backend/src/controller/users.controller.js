
// ✅ ESM imports coherentes
import bcrypt from 'bcrypt';
import firestoreService from '../service/firestoreservice.js';

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

    // (7) Unicidad: comprobación por campo → OJO ventana de carrera.
    // Ideal: usar ID determinístico (users/{emailNorm}) o uid de Auth para evitar duplicados
    const existingUsers = await firestoreService.findByField('users', 'email', emailNorm);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'El email ya existe' }); // (9) 409 Conflict
    }

    // Hashear contraseña (3, 15)
    const password_hash = await hashPassword(password);

    // Normalización de tipos (8)
    const birthdateISO = toISODate(birthdate);
    const heightNum = toNumberOrNull(height);
    const weightNum = toNumberOrNull(weight);

    const nowISO = new Date().toISOString(); // (15) timestamps
    const newUsuario = {
      nombre: (nombre ?? '').trim(),
      username: (username ?? '').trim(),
      email: emailNorm,
      password_hash,              // (4) nombre claro del campo
      photo: (photo ?? '').trim(),
      birthdate: birthdateISO,    // (8) formato consistente
      height: heightNum,          // (8) número o null
      weight: weightNum,          // (8) número o null
      goal: (goal ?? '').trim(),  // (8) podrías validar contra enum
      bcryptCost: BCRYPT_COST,    // (15) para rehash futuro
      createdAt: nowISO,          // (15)
      updatedAt: nowISO,          // (15)
    };

    // (7) Ideal: crear con ID determinístico para unicidad atómica (users/{emailNorm})
    // Si tu servicio NO tiene "set" con ID, usa create (acepta ventana de carrera).
    // 👉 Recomendado: implementar firestoreService.set(collection, id, data)
    const docId = await firestoreService.create('users', newUsuario);

    return res.status(201).json({ message: 'Usuario creado', id: docId }); // (9) 201 Created
  } catch (error) {
    console.error('[createUsu] Error:', error); // (10) log interno
    return res.status(500).json({ message: 'Error al crear usuario' }); // (10) respuesta genérica
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
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.status(200).json(usuarios[0]);
  } catch (error) {
    console.error('[getUsuByCustomId] Error:', error);
    return res.status(500).json({ message: 'Error al buscar el usuario' });
  }
};

export default usuarioCtl;
