const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    ai_model: {type: String, required: true},
    carbohydrates: {type: Number, required: true},
    proteins: {type: Number, required: true},
    id_meals: {type: [mongoose.Types.ObjectId], ref: 'Meals', required: true},
    userID: {type: mongoose.Types.ObjectId, ref: 'Users', required: true},
    micronutrients: {type: Number, required: true},
    number_meals: {type: Number, required: true},
    personal_specifications: {type: String, required: false},
    type_diet: {type: String, required: true},
    vegan: {type: Boolean, required: true, default: false},
    vegetarian: {type: Boolean, required: true, default: false}
},
{
    timestamps: true
})
module.exports = model('Infopersonalizeddiet', InfopersonalizeddietSchema);