const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Inicializar Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'in-fit-945de-firebase-adminsdk-fbsvc-3f3ff1a1fc.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Archivo de credenciales no encontrado:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://in-fit-945de.firebaseio.com'
});

const db = admin.firestore();

// Cargar los ingredientes
const foodData = require('./FoodData_Central_foundation_food_json_2025-12-18.json');

// Función para sumar nutrientes de los ingredientes
function sumNutrients(ingredients) {
  return ingredients.reduce((acc, ingredient) => {
    const food = foodData.find(f => f.nombre.toLowerCase() === ingredient.nombre.toLowerCase());
    if (!food) {
      console.warn(`⚠️  Ingrediente no encontrado: ${ingredient.nombre}`);
      return acc;
    }

    return {
      kcal: acc.kcal + (food.calorias_kcal * ingredient.quantity),
      protein: acc.protein + (food.protein_g * ingredient.quantity),
      carbohydrates: acc.carbohydrates + (food.carbohydrates_g * ingredient.quantity),
      fat: acc.fat + (food.fat_g * ingredient.quantity),
      fiber: acc.fiber + (food.fiber_g * ingredient.quantity)
    };
  }, { kcal: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 });
}

// Definir 10 dietas genéricas
const genericDiets = [
  {
    name: "Dieta para Perder Peso - Baja en Carbohidratos",
    diet_type: "Perder peso",
    vegan: false,
    vegetarian: false,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Pollo pechuga", quantity: 1 },
      { nombre: "Brócoli", quantity: 1 },
      { nombre: "Espinaca", quantity: 1 },
      { nombre: "Huevos", quantity: 2 },
      { nombre: "Almendras", quantity: 0.5 }
    ]
  },
  {
    name: "Dieta Vegana Equilibrada",
    diet_type: "Mantenimiento",
    vegan: true,
    vegetarian: true,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Lentejas", quantity: 1 },
      { nombre: "Avocado", quantity: 1 },
      { nombre: "Quinoa", quantity: 1 },
      { nombre: "Zanahoria", quantity: 1 },
      { nombre: "Nueces", quantity: 0.5 }
    ]
  },
  {
    name: "Dieta Vegetariana Alta en Proteína",
    diet_type: "Ganar musculo",
    vegan: false,
    vegetarian: true,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Huevos", quantity: 3 },
      { nombre: "Yogur griego natural", quantity: 2 },
      { nombre: "Queso mozzarella", quantity: 1 },
      { nombre: "Pan integral", quantity: 1 },
      { nombre: "Cacahuetes", quantity: 0.5 }
    ]
  },
  {
    name: "Dieta Mediterránea Saludable",
    diet_type: "Mantenimiento",
    vegan: false,
    vegetarian: false,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Salmón", quantity: 1 },
      { nombre: "Aceite de oliva", quantity: 0.1 },
      { nombre: "Tomate", quantity: 2 },
      { nombre: "Lechuga", quantity: 1 },
      { nombre: "Aceitunas", quantity: 0.3 }
    ]
  },
  {
    name: "Dieta para Ganar Músculo - Alto Aporte",
    diet_type: "Ganar musculo",
    vegan: false,
    vegetarian: false,
    gluten: false,
    number_meals: 6,
    ingredients: [
      { nombre: "Carne de res magra", quantity: 1.5 },
      { nombre: "Arroz integral", quantity: 1.5 },
      { nombre: "Huevos", quantity: 3 },
      { nombre: "Plátano", quantity: 1 },
      { nombre: "Almendras", quantity: 1 }
    ]
  },
  {
    name: "Dieta Sin Gluten Balanceada",
    diet_type: "Mantenimiento",
    vegan: false,
    vegetarian: false,
    gluten: true,
    number_meals: 5,
    ingredients: [
      { nombre: "Pavo", quantity: 1 },
      { nombre: "Papa", quantity: 1 },
      { nombre: "Brócoli", quantity: 1 },
      { nombre: "Manzana", quantity: 1 },
      { nombre: "Avocado", quantity: 0.5 }
    ]
  },
  {
    name: "Dieta Vegana Alta en Fibra",
    diet_type: "Perder peso",
    vegan: true,
    vegetarian: true,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Garbanzos secos", quantity: 1 },
      { nombre: "Espinaca", quantity: 1 },
      { nombre: "Zanahoria", quantity: 1 },
      { nombre: "Pan integral", quantity: 1 },
      { nombre: "Frambuesa", quantity: 0.5 }
    ]
  },
  {
    name: "Dieta Proteica Rápida",
    diet_type: "Ganar musculo",
    vegan: false,
    vegetarian: false,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Atún", quantity: 1 },
      { nombre: "Huevos", quantity: 2 },
      { nombre: "Pollo pechuga", quantity: 1 },
      { nombre: "Yogur natural", quantity: 1 },
      { nombre: "Almendras", quantity: 0.5 }
    ]
  },
  {
    name: "Dieta Equilibrada Saludable",
    diet_type: "Mantenimiento",
    vegan: false,
    vegetarian: false,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Merluza", quantity: 1 },
      { nombre: "Boniato", quantity: 1 },
      { nombre: "Coliflor", quantity: 1 },
      { nombre: "Pera", quantity: 1 },
      { nombre: "Aceite de oliva", quantity: 0.1 }
    ]
  },
  {
    name: "Dieta Vegetariana Liviana",
    diet_type: "Perder peso",
    vegan: false,
    vegetarian: true,
    gluten: false,
    number_meals: 5,
    ingredients: [
      { nombre: "Queso fresco", quantity: 0.5 },
      { nombre: "Lechuga", quantity: 2 },
      { nombre: "Tomate", quantity: 2 },
      { nombre: "Apio", quantity: 1 },
      { nombre: "Almendras", quantity: 0.3 }
    ]
  }
];

// Función principal
async function generateAndUploadDiets() {
  try {
    console.log('🚀 Iniciando generación de dietas genéricas...\n');

    const batch = db.batch();
    let dietCount = 0;

    for (const diet of genericDiets) {
      // Sumar nutrientes
      const nutrients = sumNutrients(diet.ingredients);

      // Preparar documento
      const dietData = {
        name: diet.name,
        diet_type: diet.diet_type,
        vegan: diet.vegan,
        vegetarian: diet.vegetarian,
        gluten: diet.gluten,
        number_meals: diet.number_meals,
        kcal: Math.round(nutrients.kcal),
        protein: Math.round(nutrients.protein),
        carbohydrates: Math.round(nutrients.carbohydrates),
        fat: Math.round(nutrients.fat),
        fiber: Math.round(nutrients.fiber),
        micronutrients: Math.round(nutrients.protein * 0.1), // Aproximación simple
        ingredients: diet.ingredients.map(ing => ing.nombre),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Agregar a batch
      const docRef = db.collection('infogenericdiet').doc();
      batch.set(docRef, dietData);

      console.log(`✅ Dieta ${++dietCount}: ${diet.name}`);
      console.log(`   📊 Kcal: ${dietData.kcal} | Proteína: ${dietData.protein}g | Carbohidratos: ${dietData.carbohydrates}g`);
      console.log(`   🥘 Ingredientes: ${diet.ingredients.map(i => i.nombre).join(', ')}\n`);
    }

    // Ejecutar batch
    await batch.commit();
    console.log('✅ ¡Todas las dietas han sido creadas exitosamente en Firestore!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al generar dietas:', error);
    process.exit(1);
  }
}

// Ejecutar
generateAndUploadDiets();
