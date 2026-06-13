// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ msg: 'Usuario y contraseña son obligatorios.' });
    }

    // Sanity-check: prevent absurdly long inputs from reaching the DB
    if (typeof usuario !== 'string' || usuario.length > 100) {
        return res.status(400).json({ msg: 'Datos de entrada inválidos.' });
    }
    if (typeof password !== 'string' || password.length > 200) {
        return res.status(400).json({ msg: 'Datos de entrada inválidos.' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM administradores WHERE usuario = $1',
            [usuario]
        );

        const admin = result.rows[0];

        // Respond with same generic message whether user doesn't exist or password is wrong
        // (prevents username enumeration)
        if (!admin) {
            return res.status(401).json({ msg: 'Credenciales incorrectas.' });
        }

        const esValida = await bcrypt.compare(password, admin.password_hash);

        if (!esValida) {
            return res.status(401).json({ msg: 'Credenciales incorrectas.' });
        }

        // Issue a real JWT signed with the server secret, expires in 24h
        const token = jwt.sign(
            { id: admin.id, usuario: admin.usuario },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ token });

    } catch (err) {
        console.error('[login]', err);
        // Return generic message — never expose internal error details
        res.status(500).json({ msg: 'Error interno en el servidor.' });
    }
};