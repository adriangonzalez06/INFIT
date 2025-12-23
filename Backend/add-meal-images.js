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

// Mapeo de nombres de platos con URLs de imágenes
const mealImages = {
  "Ensalada de Pollo Grillado": "https://via.placeholder.com/300?text=Ensalada+Pollo",
  "Pasta Integral con Salsa de Tomate": "https://via.placeholder.com/300?text=Pasta",
  "Salmón a la Mantequilla": "https://via.placeholder.com/300?text=Salmon",
  "Arroz Integral con Verduras": "https://via.placeholder.com/300?text=Arroz",
  "Pechuga de Pavo con Espárragos": "https://via.placeholder.com/300?text=Pavo",
  "Avena con Frutos Rojos": "https://via.placeholder.com/300?text=Avena",
  "Lentejas Guisadas": "https://via.placeholder.com/300?text=Lentejas",
  "Huevos Revueltos con Champiñones": "https://via.placeholder.com/300?text=Huevos",
  "Pechuga de Pollo con Quinoa": "https://via.placeholder.com/300?text=Pollo+Quinoa",
  "Merluza al Horno": "https://via.placeholder.com/300?text=Merluza",
  "Garbanzos Tostados con Vegetales": "https://via.placeholder.com/300?text=Garbanzos",
  "Yogur Griego con Granola": "https://via.placeholder.com/300?text=Yogur",
  "Ensalada de Quinoa": "https://via.placeholder.com/300?text=Quinoa",
  "Atún a la Plancha": "https://via.placeholder.com/300?text=Atun",
  "Tostadas de Pavo": "https://via.placeholder.com/300?text=Tostadas",
  "Batido Proteico de Frutas": "https://via.placeholder.com/300?text=Batido",
  "Carne de Res Magra con Vegetales": "https://via.placeholder.com/300?text=Carne",
  "Sopa de Verduras": "https://via.placeholder.com/300?text=Sopa",
  "Arroz Blanco con Pollo": "https://via.placeholder.com/300?text=Arroz+Pollo",
  "Smoothie Bowl": "https://via.placeholder.com/300?text=Smoothie+Bowl"
};

async function updateMealsWithImages() {
  try {
    console.log('📸 Actualizando platos con imágenes...\n');

    const querySnapshot = await db.collection('infomeals').get();
    let updateCount = 0;
    const batch = db.batch();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const mealName = data.name;
      const image = mealImages[mealName] || "https://via.placeholder.com/300?text=Plato";
      
      batch.update(doc.ref, { image });
      
      console.log(`✅ Actualizando: ${mealName}`);
      updateCount++;
    });

    await batch.commit();
    console.log(`\n✅ Se actualizaron ${updateCount} platos con imágenes`);
    console.log('\n💡 Nota: Las URLs son placeholders. Puedes reemplazarlas con tus propias URLs');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al actualizar platos:', error);
    process.exit(1);
  }
}

// Ejecutar
updateMealsWithImages();
