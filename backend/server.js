const express = require('express'); // Framework web para Node.js.
const cors = require('cors'); // Middleware para permitir peticiones desde diferentes dominios (CORS).
const equipoRoutes = require('./routes/equipoRoutes'); // Rutas para la gestión de equipos.
const jugadorRoutes = require('./routes/jugadorRoutes'); // Rutas para la gestión de jugadores.
const partidoRoutes = require('./routes/partidoRoutes'); // Rutas para la gestión de partidos y resultados.
const clasificacionRoutes = require('./routes/clasificacionRoutes'); // Rutas para consultar la tabla de posiciones.

const app = express(); // Inicialización de la aplicación Express.

// MIDDLEWARES GLOBALES
app.use(cors()); // Habilita el intercambio de recursos de origen cruzado para el frontend.
app.use(express.json()); // Permite que el servidor entienda y procese datos en formato JSON en el cuerpo de las peticiones.

// --- REGISTRO DE RUTAS ---
// Montamos los enrutadores específicos bajo sus respectivos prefijos de API.
app.use('/api/equipos', equipoRoutes); // Endpoint: http://localhost:3000/api/equipos
app.use('/api/partidos', partidoRoutes); // Endpoint: http://localhost:3000/api/partidos
app.use('/api/jugadores', jugadorRoutes); // Endpoint: http://localhost:3000/api/jugadores
app.use('/api/clasificacion', clasificacionRoutes); // Endpoint: http://localhost:3000/api/clasificacion

//  AUTENTICACIÓN 
// Endpoint simplificado para el login administrativo. 
// En un entorno de producción, esto debería validar contra una base de datos y usar JWT.
app.post('/api/auth/login', (req, res) => {
    const { usuario, password } = req.body;
    // Validación estática de credenciales para el administrador.
    if (usuario === 'danielfonseca' && password === '1141316532Df.') {
        // Retornamos un token estático que el frontend enviará en el header 'Authorization'.
        res.json({ success: true, token: "token_app" });
    } else {
        res.status(401).json({ success: false, msg: "Credenciales incorrectas" });
    }
});

// INICIO DEL SERVIDOR 
const PORT = 3000; // Puerto donde escuchará el servidor.
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));