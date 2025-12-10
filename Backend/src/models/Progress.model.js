const mongoose = require('mongoose');

const { Schema, model } = mongoose;



const UsersPremiumSchema = new Schema({
    completed_levels: { type: Number, required: true, default: 0 },
    photos: { type: [String], required: false },
    streak: { type: Number, required: true, default: 0 },
    userID: { type: mongoose.Types.ObjectId, ref: 'Users', required: true },
}, {
    timestamps: true
});

module.exports = model('Progress', ProgressSchema);