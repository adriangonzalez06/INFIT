const ingredientsCtl = {};
const path = require('path');
const fs = require('fs');

// Función para obtener la ruta del archivo JSON
const getFoodDataPath = () => {
    return path.join(__dirname, '../../FoodData_Central_foundation_food_json_2025-12-18.json');
};

// Función para cargar datos del JSON
const loadFoodData = () => {
    try {
        const foodDataPath = getFoodDataPath();
        if (fs.existsSync(foodDataPath)) {
            const rawData = fs.readFileSync(foodDataPath, 'utf-8');
            const foodData = JSON.parse(rawData);
            console.log('✅ Archivo de ingredientes cargado:', foodData.length, 'ingredientes');
            return foodData;
        } else {
            console.error('❌ Archivo de ingredientes no encontrado:', foodDataPath);
            return [];
        }
    } catch (error) {
        console.error('❌ Error al cargar el archivo de ingredientes:', error);
        return [];
    }
};

// Obtener todos los ingredientes
ingredientsCtl.getAll = async (req, res) => {
    try {
        const foodData = loadFoodData();
        
        if (!foodData || foodData.length === 0) {
            console.warn('⚠️ No hay datos de ingredientes disponibles');
            return res.json([]);
        }

        // Convertir los datos del JSON al formato que espera el Frontend
        const ingredients = foodData.map((food, index) => ({
            id: index,
            name: food.nombre,
            calories: food.calorias_kcal,
            fiber: food.fiber_g,
            carbohydrates: food.carbohydrates_g,
            fat: food.fat_g,
            protein: food.protein_g
        }));

        console.log('📤 Enviando', ingredients.length, 'ingredientes al frontend');
        res.json(ingredients);
    } catch (error) {
        console.error('❌ Error en getAll:', error);
        res.status(500).json({ message: 'Error al obtener ingredientes', error: error.message });
    }
}

// Buscar ingredientes por nombre
ingredientsCtl.search = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: 'Se requiere parámetro query' });
        }

        const foodData = loadFoodData();
        const searchTerm = query.toLowerCase();
        
        const filteredFoods = foodData.filter(food => 
            food.nombre.toLowerCase().includes(searchTerm)
        );

        const ingredients = filteredFoods.map((food, index) => ({
            id: index,
            name: food.nombre,
            calories: food.calorias_kcal,
            fiber: food.fiber_g,
            carbohydrates: food.carbohydrates_g,
            fat: food.fat_g,
            protein: food.protein_g
        }));

        console.log('📤 Búsqueda "' + query + '": encontrados', ingredients.length, 'ingredientes');
        res.json(ingredients);
    } catch (error) {
        console.error('❌ Error en search:', error);
        res.status(500).json({ message: 'Error al buscar ingredientes', error: error.message });
    }
}

module.exports = ingredientsCtl;
