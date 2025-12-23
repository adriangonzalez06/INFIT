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

// Definir 20 platos genéricos
const meals = [
  {
    name: "Ensalada Mediterránea",
    kcal: 250,
    macronutrients: { protein: 15, carbs: 20, fat: 12 },
    ingredients: ["Lechuga", "Tomate", "Cebolla", "Aceitunas", "Queso fresco"],
    vegetarian: true,
    vegan: false,
    gluten: false
  },
  {
    name: "Pechuga de Pollo a la Parrilla",
    kcal: 350,
    macronutrients: { protein: 45, carbs: 0, fat: 15 },
    ingredients: ["Pollo pechuga", "Sal", "Pimienta negra", "Aceite de oliva"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Salmón con Espárragos",
    kcal: 400,
    macronutrients: { protein: 35, carbs: 8, fat: 22 },
    ingredients: ["Salmón", "Espárragos", "Limón", "Aceite de oliva"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Pasta Integral con Vegetales",
    kcal: 380,
    macronutrients: { protein: 14, carbs: 62, fat: 8 },
    ingredients: ["Pasta", "Tomate", "Cebolla", "Brócoli", "Ajo"],
    vegetarian: true,
    vegan: true,
    gluten: false
  },
  {
    name: "Arroz Integral con Lentejas",
    kcal: 320,
    macronutrients: { protein: 18, carbs: 52, fat: 5 },
    ingredients: ["Arroz integral", "Lentejas", "Cebolla", "Zanahoria", "Ajo"],
    vegetarian: true,
    vegan: true,
    gluten: false
  },
  {
    name: "Hamburguesa de Carne Magra",
    kcal: 450,
    macronutrients: { protein: 40, carbs: 35, fat: 15 },
    ingredients: ["Carne de res magra", "Pan integral", "Lechuga", "Tomate"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Omelette de Vegetales",
    kcal: 280,
    macronutrients: { protein: 20, carbs: 8, fat: 18 },
    ingredients: ["Huevos", "Pimiento rojo", "Cebolla", "Champiñones", "Queso"],
    vegetarian: true,
    vegan: false,
    gluten: false
  },
  {
    name: "Sopa de Verduras",
    kcal: 180,
    macronutrients: { protein: 8, carbs: 25, fat: 4 },
    ingredients: ["Zanahoria", "Calabacín", "Cebolla", "Tomate", "Caldo de pollo"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Pollo con Quinoa",
    kcal: 420,
    macronutrients: { protein: 38, carbs: 40, fat: 12 },
    ingredients: ["Pollo pechuga", "Quinoa", "Zanahoria", "Cebolla", "Ajo"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Tazón de Avena con Frutas",
    kcal: 290,
    macronutrients: { protein: 10, carbs: 48, fat: 8 },
    ingredients: ["Avena", "Plátano", "Berries", "Miel", "Almendras"],
    vegetarian: true,
    vegan: true,
    gluten: false
  },
  {
    name: "Filete de Pescado",
    kcal: 320,
    macronutrients: { protein: 38, carbs: 5, fat: 14 },
    ingredients: ["Merluza", "Limón", "Perejil", "Sal", "Aceite de oliva"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Burrito de Frijoles",
    kcal: 380,
    macronutrients: { protein: 14, carbs: 58, fat: 10 },
    ingredients: ["Tortilla de trigo", "Judías secas", "Cebolla", "Tomate", "Queso"],
    vegetarian: true,
    vegan: false,
    gluten: false
  },
  {
    name: "Brócoli al Horno",
    kcal: 150,
    macronutrients: { protein: 12, carbs: 18, fat: 6 },
    ingredients: ["Brócoli", "Aceite de oliva", "Ajo", "Sal", "Pimienta"],
    vegetarian: true,
    vegan: true,
    gluten: false
  },
  {
    name: "Yogur Griego con Granola",
    kcal: 220,
    macronutrients: { protein: 20, carbs: 22, fat: 6 },
    ingredients: ["Yogur griego natural", "Granola", "Miel", "Fresas"],
    vegetarian: true,
    vegan: false,
    gluten: false
  },
  {
    name: "Sándwich de Atún",
    kcal: 340,
    macronutrients: { protein: 25, carbs: 35, fat: 12 },
    ingredients: ["Atún", "Pan integral", "Mayonesa", "Lechuga", "Tomate"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Tacos de Pollo",
    kcal: 360,
    macronutrients: { protein: 32, carbs: 38, fat: 10 },
    ingredients: ["Tortilla de maíz", "Pollo pechuga", "Cebolla", "Cilantro", "Limón"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Batata Asada",
    kcal: 200,
    macronutrients: { protein: 4, carbs: 45, fat: 1 },
    ingredients: ["Boniato", "Sal", "Pimienta", "Aceite en spray"],
    vegetarian: true,
    vegan: true,
    gluten: false
  },
  {
    name: "Calabacín Relleno",
    kcal: 280,
    macronutrients: { protein: 18, carbs: 15, fat: 14 },
    ingredients: ["Calabacín", "Carne de res magra", "Tomate", "Queso", "Cebolla"],
    vegetarian: false,
    vegan: false,
    gluten: false
  },
  {
    name: "Smoothie de Proteína",
    kcal: 210,
    macronutrients: { protein: 25, carbs: 18, fat: 5 },
    ingredients: ["Leche", "Plátano", "Proteína en polvo", "Fresas"],
    vegetarian: true,
    vegan: false,
    gluten: false
  },
  {
    name: "Ensalada de Garbanzos",
    kcal: 310,
    macronutrients: { protein: 16, carbs: 38, fat: 11 },
    ingredients: ["Garbanzos secos", "Tomate", "Cebolla", "Cilantro", "Limón"],
    vegetarian: true,
    vegan: true,
    gluten: false
  }
];

async function generateMealsFromIngredients() {
  try {
    console.log('🚀 Iniciando generación de platos...\n');

    const batch = db.batch();
    let mealCount = 0;

    for (const meal of meals) {
      // Agregar a batch
      const docRef = db.collection('infomeals').doc();
      batch.set(docRef, {
        ...meal,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Plato ${++mealCount}: ${meal.name}`);
      console.log(`   📊 Kcal: ${meal.kcal} | Ingredientes: ${meal.ingredients.join(', ')}\n`);
    }

    // Ejecutar batch
    await batch.commit();
    console.log('✅ ¡Todos los platos han sido creados exitosamente en Firestore!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al generar platos:', error);
    process.exit(1);
  }
}

// Ejecutar
generateMealsFromIngredients();
