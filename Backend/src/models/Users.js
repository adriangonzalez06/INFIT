const { Schema, model } = require('mongoose');

const UsersSchema = new Schema({
  id_user: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, required: false },
  birthday: { type: Date, required: true },
  sex: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  goal: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = model('Usuario', UsersSchema);