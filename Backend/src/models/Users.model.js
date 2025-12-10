const {Schema, model} = require('mongoose');


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    id_user: {type: Number, required: true},
    username: {type: String, required: true, unique: true},
    nombre: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    photo: {type: String, required: false},
    birthdate: {type: Date, required: true},
    height: {type: Number, required: true},
    weight: {type: Number, required: true},
    goal: {type: String, required: true},
},
{
    timestamps: true
})
module.exports = model('Users', UsersSchema);