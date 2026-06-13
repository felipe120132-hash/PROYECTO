/*
 * Middleware de Autenticación
 * Verifica que el request lleve un JWT válido firmado por este servidor.
 * Si el token es inválido, expiró, o no existe — bloquea el acceso con 401.
 */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No autorizado: token no provisto.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify signature AND expiration automatically
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // attach payload for downstream use
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Sesión expirada. Por favor iniciá sesión nuevamente.' });
        }
        return res.status(401).json({ msg: 'Token inválido.' });
    }
};