const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    gluten: {type: Boolean, required: true, default: false},
    ingredients: {type: [String], required: false},
    kcal: {type: Number, required: true},
    macronutrients: {type: Object, required: true},
    name: {type: String, required: true},
    photo: {type: String, required: false},
    vegan: {type: Boolean, required: true, default: false},
    vegetarian: {type: Boolean, required: true, default: false},
},
{
    timestamps: true
})
module.exports = model('Infomeals', InfomealsSchema);