const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de una dienta generica, para los usuarios gratis, cambiar segun las necesidades
const UsersSchema = new Schema({
  
    carbohydrates: {type: Number, required: true},
    proteins: {type: Number, required: true},
    id_meals: {type: [mongoose.Types.ObjectId], ref: 'Meals', required: true},
    kcal: {type: Number, required: true},
    micronutrients: {type: Number, required: true},
    number_meals: {type: Number, required: true},
    gluten: {type: Boolean, required: true, default: false},
    diet_type: {type: String, required: true},
    vegan: {type: Boolean, required: true, default: false},
    vegetarian: {type: Boolean, required: true, default: false}
},
{
    timestamps: true
})
module.exports = model('infogenericdiet', infogenericdietSchema);