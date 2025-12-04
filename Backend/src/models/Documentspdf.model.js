const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    font : {type: String, required: true},
    title : {type: String, required: true},
    vectorial_embedding : {type: String, required: true},
},
{
    timestamps: true
})
module.exports = model('Documentspdf', DocumentspdfSchema);