const {Schema, model, default: mongoose} = require('mongoose');


//Ejemplo para crear un esquema de usuario, cambiar segun las necesidades
const FreeUsersSchema = new Schema({
    userID: {type: mongoose.Types.ObjectId, ref: 'Users', required: true},
    ads_per_hour_gone: {type: Number, required: true, default: 6},
},
{
    timestamps: true
})
module.exports = model('FreeUsers', FreeUsersSchema);