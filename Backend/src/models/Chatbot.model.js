const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    c_ai_model: {type: String, required: true},
    c_languages: {type: [String], required: true},
    c_name: {type: String, required: true},
    c_state: {type: [String], required: true},
    version: {type: String, required: true},
},
{
    timestamps: true
})
module.exports = model('Documentspdf', DocumentspdfSchema);