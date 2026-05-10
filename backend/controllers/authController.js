// controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { usuario, password } = req.body;

    // Validación básica de campos
    if (!usuario || !password) {
        return res.status(400).json({ msg: 'Usuario y contraseña son obligatorios.' });
    }

    try {
        // 1. Buscar el administrador por nombre de usuario en la BD
        const [[admin]] = await db.query(
            'SELECT * FROM administradores WHERE usuario = ?',
            [usuario]
        );

        // 2. Si no existe el usuario, responder con error genérico
        //    (no decir "usuario no encontrado" por seguridad)
        if (!admin) {
            return res.status(401).json({ msg: 'Credenciales incorrectas.' });
        }

        // 3. Comparar la contraseña ingresada contra el hash de la BD
        const esValida = await bcrypt.compare(password, admin.password_hash);

        if (!esValida) {
            return res.status(401).json({ msg: 'Credenciales incorrectas.' });
        }

        // 4. Credenciales correctas → devolver token
        return res.json({ token: 'token_app' });

    } catch (err) {
        console.error('[login]', err);
        res.status(500).json({ msg: 'Error interno en el servidor.' });
    }
};