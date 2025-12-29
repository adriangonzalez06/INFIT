/**
 * Script de prueba para verificar conexión a Firestore
 * y guardar una dieta de prueba
 */

require('dotenv').config();
const firestoreService = require('./src/service/firestoreservice');

async function testFirestore() {
  console.log('🧪 Iniciando prueba de Firestore...\n');

  try {
    // 1. Inicializar Firestore
    console.log('1️⃣  Inicializando Firestore...');
    firestoreService.initialize();
    console.log('✅ Firestore inicializado\n');

    // 2. Verificar conexión
    console.log('2️⃣  Verificando conexión...');
    const isConnected = await firestoreService.checkConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a Firestore');
    }
    console.log('✅ Conexión verificada\n');

    // 3. Crear una dieta de prueba
    console.log('3️⃣  Creando dieta de prueba...');
    const testDiet = {
      name: 'Dieta de Prueba',
      description: 'Esta es una dieta de prueba',
      userID: 'test-user-123',
      // weeklyDishes debe ser un objeto con claves numéricas (Firestore no permite arrays anidados)
      weeklyDishes: {
        '0': [
          {
            id: '1',
            name: 'Desayuno 1',
            calories: 500,
            macronutrients: 25,
            ingredients: ['huevo', 'pan'],
            vegetarian: true,
            vegan: false,
            gluten_free: false
          }
        ],
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': []
      },
      imgUrl: 'https://via.placeholder.com/300',
      type_diet: 'personalizada',
      number_meals: 5,
      vegetarian: false,
      vegan: false
    };

    const docId = await firestoreService.create('infopersonalizeddiet', testDiet);
    console.log(`✅ Dieta creada con ID: ${docId}\n`);

    // 4. Verificar que se guardó
    console.log('4️⃣  Verificando que se guardó correctamente...');
    const savedDiet = await firestoreService.getById('infopersonalizeddiet', docId);
    console.log('✅ Dieta recuperada:');
    console.log(JSON.stringify(savedDiet, null, 2));
    console.log('\n');

    // 5. Recuperar dietas del usuario
    console.log('5️⃣  Recuperando dietas del usuario test-user-123...');
    const userDiets = await firestoreService.findByField('infopersonalizeddiet', 'userID', 'test-user-123');
    console.log(`✅ Se encontraron ${userDiets.length} dieta(s):`);
    console.log(JSON.stringify(userDiets, null, 2));
    console.log('\n');

    console.log('✅ ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFirestore();
