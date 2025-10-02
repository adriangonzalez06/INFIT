const userPremiumCtl = {};

const UserPremium = require('../models/UserPremium.js');

userPremiumCtl.createUsu = async (req, res) => {
    const {userID, subscription_type, start_date, end_date} = req.body;
    const newUserPremium = new UserPremium({userID: userID, auto_renew: auto_renew, expiration_day: expiration_day, payment_method: payment_method});
    await newUserPremium.save();
    res.json({message: 'Usuario Premium creado'});
}

userPremiumCtl.getUsu = async (req, res) => {
    const usersPremium = await UserPremium.find();
    res.json(usersPremium);
}

userPremiumCtl.getUsuById = async (req, res) => {
    const userPremium = await UserPremium.findById(req.params.id);
    res.json(userPremium);
}

userPremiumCtl.deleteUsu = async (req, res) => {
    await UserPremium.findByIdAndDelete(req.params.id);
    res.json({message: 'Usuario Premium eliminado'});
}

userPremiumCtl.updateUsu = async (req, res) => {
    const {userID, subscription_type, start_date, end_date} = req.body;
    await UserPremium.findByIdAndUpdate(req.params.id, {userID, auto_renew, expiration_day, payment_method});
    res.json({message: 'Usuario Premium actualizado'});
}

module.exports = userPremiumCtl;