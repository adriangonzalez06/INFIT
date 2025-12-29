/**
 * Modelo de Infopersonalizeddiet para Firestore
 * Documento de dieta personalizada creada por un usuario
 * Estructura de datos para guardar en la colección 'infopersonalizeddiet'
 */

const InfopersonalizeddietSchema = {
    name: {
        type: String,
        required: true,
        description: "Nombre de la dieta personalizada"
    },
    description: {
        type: String,
        required: false,
        description: "Descripción de la dieta"
    },
    userID: {
        type: String,
        required: true,
        description: "ID del usuario que creó la dieta (referencia a usuarios)"
    },
    ai_model: {
        type: String,
        required: false,
        description: "Modelo de IA usado para generar la dieta"
    },
    carbohydrates: {
        type: Number,
        required: false,
        description: "Cantidad de carbohidratos"
    },
    proteins: {
        type: Number,
        required: false,
        description: "Cantidad de proteínas"
    },
    id_meals: {
        type: Array,
        required: false,
        description: "IDs de las comidas/platos incluidas"
    },
    micronutrients: {
        type: Number,
        required: false,
        description: "Cantidad de micronutrientes"
    },
    number_meals: {
        type: Number,
        required: false,
        description: "Número de comidas por día"
    },
    personal_specifications: {
        type: String,
        required: false,
        description: "Especificaciones personales del usuario"
    },
    type_diet: {
        type: String,
        required: false,
        description: "Tipo de dieta (balanceada, vegana, cetogénica, etc)"
    },
    vegan: {
        type: Boolean,
        required: false,
        default: false,
        description: "¿La dieta es vegana?"
    },
    vegetarian: {
        type: Boolean,
        required: false,
        default: false,
        description: "¿La dieta es vegetariana?"
    },
    weeklyDishes: {
        type: Array,
        required: false,
        description: "Estructura de platos por día de la semana"
    },
    imgUrl: {
        type: String,
        required: false,
        description: "URL de la imagen de la dieta"
    },
    createdAt: {
        type: "timestamp",
        description: "Fecha de creación (Firestore timestamp)"
    },
    updatedAt: {
        type: "timestamp",
        description: "Fecha de última actualización (Firestore timestamp)"
    }
};

module.exports = InfopersonalizeddietSchema;