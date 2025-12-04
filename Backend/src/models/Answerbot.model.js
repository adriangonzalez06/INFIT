const {Schema, model} = require('mongoose');

const { Schema, model } = mongoose;


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const UsersSchema = new Schema({
    answer_text: {type: String, required: true},
    answer_timestamp: {type: Date, required: true},
    id_chatbot: {type: Schema.Types.ObjectId, ref: 'Chatbot', required: true},
    id_query: {type: Schema.Types.ObjectId, ref: 'Queries', required: true},
},
{
    timestamps: true
})
module.exports = model('Answerbot', AnswerbotSchema);