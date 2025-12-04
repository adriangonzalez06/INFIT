const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Servicio centralizado para Firebase Firestore
 * Maneja la inicialización y conexión a la base de datos
 */

class FirestoreService {
  constructor() {
    this.db = null;
  }

  /**
   * Inicializa la conexión a Firebase
   * @returns {object} Instancia de Firestore
   */
  initialize() {
    try {
      // Buscar archivo de credenciales
      const possiblePaths = [
        path.join(__dirname, '../../in-fit-945de-firebase-adminsdk-fbsvc-73060b4f8d.json'),
        path.join(__dirname, '../../firebase-service-account.json')
      ];

      let serviceAccountPath = null;
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          serviceAccountPath = filePath;
          break;
        }
      }

      if (!serviceAccountPath) {
        console.error('⚠️  IMPORTANTE: No se encontró el archivo de credenciales Firebase');
        console.error('Se espera uno de estos archivos en la carpeta Backend/:');
        possiblePaths.forEach(p => console.error(`  - ${path.basename(p)}`));
        process.exit(1);
      }

      const serviceAccount = require(serviceAccountPath);

      // Inicializar Firebase solo si no está inicializado
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      this.db = admin.firestore();
      console.log('✅ Firebase Firestore inicializado correctamente');
      
      return this.db;
    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error.message);
      process.exit(1);
    }
  }

  /**
   * Obtiene la instancia de Firestore
   * @returns {object} Instancia de Firestore
   */
  getDb() {
    if (!this.db) {
      return this.initialize();
    }
    return this.db;
  }

  /**
   * Obtener todos los documentos de una colección
   * @param {string} collectionName - Nombre de la colección
   * @returns {Promise<Array>} Array de documentos
   */
  async getAll(collectionName) {
    try {
      const snapshot = await this.db.collection(collectionName).get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (error) {
      throw new Error(`Error obteniendo documentos de ${collectionName}: ${error.message}`);
    }
  }

  /**
   * Obtener un documento por ID
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @returns {Promise<object>} Documento encontrado
   */
  async getById(collectionName, docId) {
    try {
      const doc = await this.db.collection(collectionName).doc(docId).get();
      if (!doc.exists) {
        throw new Error('Documento no encontrado');
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error obteniendo documento: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo documento
   * @param {string} collectionName - Nombre de la colección
   * @param {object} data - Datos del documento
   * @returns {Promise<string>} ID del documento creado
   */
  async create(collectionName, data) {
    try {
      const newData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await this.db.collection(collectionName).add(newData);
      return docRef.id;
    } catch (error) {
      throw new Error(`Error creando documento en ${collectionName}: ${error.message}`);
    }
  }

  /**
   * Actualizar un documento
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @param {object} data - Datos a actualizar
   * @returns {Promise<void>}
   */
  async update(collectionName, docId, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      await this.db.collection(collectionName).doc(docId).update(updateData);
    } catch (error) {
      throw new Error(`Error actualizando documento en ${collectionName}: ${error.message}`);
    }
  }

  /**
   * Eliminar un documento
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @returns {Promise<void>}
   */
  async delete(collectionName, docId) {
    try {
      await this.db.collection(collectionName).doc(docId).delete();
    } catch (error) {
      throw new Error(`Error eliminando documento de ${collectionName}: ${error.message}`);
    }
  }

  /**
   * Buscar documentos por un campo específico
   * @param {string} collectionName - Nombre de la colección
   * @param {string} fieldName - Nombre del campo
   * @param {*} value - Valor a buscar
   * @returns {Promise<Array>} Array de documentos encontrados
   */
  async findByField(collectionName, fieldName, value) {
    try {
      const snapshot = await this.db.collection(collectionName).where(fieldName, '==', value).get();
      if (snapshot.empty) {
        return [];
      }
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (error) {
      throw new Error(`Error buscando en ${collectionName}: ${error.message}`);
    }
  }

  /**
   * Verificar conexión a Firestore
   * @returns {Promise<boolean>} true si la conexión es exitosa
   */
  async checkConnection() {
    try {
      await this.db.collection('_connection_test').limit(1).get();
      console.log('✅ Conexión a Firestore verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión a Firestore:', error.message);
      return false;
    }
  }
}

// Exportar instancia única (Singleton)
module.exports = new FirestoreService();
