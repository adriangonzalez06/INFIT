const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    difficulty: {type: String, required: true},
    gif : {type: String, required: false},
    image : {type: String, required: false},
    name: {type: String, required: true},
    muscular_group: {type: String, required: true},
    repetitions: {type: Number, required: true},
    sets: {type: Number, required: true},
    weight: {type: Number, required: false},
},
{
    timestamps: true
})
module.exports = model('Exercises', ExercisesSchema);