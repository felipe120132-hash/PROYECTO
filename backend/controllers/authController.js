// controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ msg: 'Usuario y contraseña son obligatorios.' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM administradores WHERE usuario = $1',
            [usuario]
        );

        const admin = result.rows[0];

        if (!admin) {
            return res.status(401).json({ msg: 'Credenciales incorrectas.' });
        }

        const esValida = await bcrypt.compare(password, admin.password_hash);

        if (!esValida) {
            return res.status(401).json({ msg: 'Credenciales incorrectas.' });
        }

        return res.json({ token: 'token_app' });

    } catch (err) {
        console.error('[login]', err);
        res.status(500).json({ msg: 'Error interno en el servidor.' });
    }
};