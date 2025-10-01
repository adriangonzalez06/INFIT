const freeusersCtl = {};

const FreeUsers = require('../models/FreeUsers.js');

freeusersCtl.createFreeUsu = async (req, res) => {
    const {userID, ads_per_hour_gone} = req.body;
    const newFreeUser = new FreeUsers({userID: userID, ads_per_hour_gone: ads_per_hour_gone});
    await newFreeUser.save();
    res.json({message: 'Free User creado'});
}

freeusersCtl.getFreeUsu = async (req, res) => {
    const freeusers = await FreeUsers.find();
    res.json(freeusers);
}

freeusersCtl.getFreeUsuById = async (req, res) => {
    const freeuser = await FreeUsers.findById(req.params.id);
    res.json(freeuser);
}

freeusersCtl.deleteFreeUsu = async (req, res) => {
    await FreeUsers.findByIdAndDelete(req.params.id);
    res.json({message: 'Free User eliminado'});
}

freeusersCtl.updateFreeUsu = async (req, res) => {
    const {userID, ads_per_hour_gone} = req.body;
    await FreeUsers.findByIdAndUpdate(req.params.id, {userID, ads_per_hour_gone});
    res.json({message: 'Free User actualizado'});
}

module.exports = freeusersCtl;