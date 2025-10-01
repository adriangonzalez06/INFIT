const mongoose = require('mongoose');

const { Schema, model } = mongoose;



const UsersPremiumSchema = new Schema({
    userID: { type: mongoose.Types.ObjectId, ref: 'Users', required: true },
    expiration_day: { type: Date, required: true },
    payment_method: { type: String, required: true },
    auto_renew: { type: Boolean, required: true, default: true },
}, {
    timestamps: true
});

module.exports = model('UsersPremium', UsersPremiumSchema);