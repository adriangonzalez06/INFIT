const usuarioCtl = {};

const Usuario = require('../models/Users')

usuarioCtl.getUsu = async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
}

usuarioCtl.createUsu = async (req, res) => {
  try {
    const {
      id_user,
      name,
      email,
      password,
      photo,
      birthday,
      sex,
      height,
      weight,
      goal
    } = req.body;

    const saltRounds = 10;
    const hasedPassword = await bcrypt.hash(password, saltRounds);

    const newUsuario = new Usuario({
      id_user,
      name,
      email,
      password: hasedPassword,
      photo,
      birthday,
      sex,
      height,
      weight,
      goal
    });

    await newUsuario.save();
    res.status(201).json({ message: 'Usuario creado correctamente', usuario: newUsuario });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
};


usuarioCtl.getUsuById = async (req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    res.json(usuario);
}

usuarioCtl.deleteUsu = async (req, res) => {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({message: 'Usuario eliminado'});
}

usuarioCtl.updateUsu = async (req, res) => {
    const {nombre, email, password} = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, {nombre, email, password});
    res.json({message: 'Usuario actualizado'});
}

usuarioCtl.getUsuByCustomId = async (req, res) => {

    try {
        const idUser = parseInt(req.params.id_user);
        const usuario = await Usuario.findOne({ id_user: idUser });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar el usuario', error });
    }
}


module.exports = usuarioCtl;