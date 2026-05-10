/*
 * Middleware de Autenticación
 * Se encarga de interceptar las peticiones a rutas protegidas para verificar la identidad del usuario.
 */
module.exports = (req, res, next) => {
    // Extraemos el encabezado 'authorization' de la petición HTTP.
    const authHeader = req.headers['authorization'];

    // Verificamos si el encabezado existe y si coincide con el token estático definido.
    if (authHeader && authHeader === 'Bearer token_app') {
        next(); // Si es válido, pasamos al siguiente middleware o controlador.
    } else {
        // Si no hay token o es incorrecto, bloqueamos el acceso con un código 401 (No autorizado).
        res.status(401).json({ msg: "No autorizado" });
    }
};