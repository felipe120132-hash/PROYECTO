const express = require('express'); // Importamos Express para la gestión de rutas.
const router = express.Router(); // Inicializamos el enrutador de Express.
const jugadorController = require('../controllers/jugadorController'); // Importamos el controlador de jugadores.
const auth = require('../middlewares/authMiddleware'); // Importamos el middleware de autenticación para proteger rutas.
const multer = require('multer');
const path = require('path');

// Configuración de multer para almacenar temporalmente los archivos en el servidor
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
    }
});

const upload = multer({ storage: storage });

//RUTAS DE JUGADORES

// Obtener todos los jugadores pertenecientes a un equipo específico por su ID (Público).
router.get('/equipo/:equipoId', jugadorController.obtenerJugadoresPorEquipo);

// Registrar un nuevo jugador en un equipo (Acción protegida para administradores).
router.post('/', auth, jugadorController.agregarJugador);

// Actualizar la información (nombre, categoría, puntos) de un jugador existente (Acción protegida).
router.put('/:id', auth, jugadorController.actualizarJugador);

// Subir/actualizar foto del jugador
router.put('/:id/foto', auth, upload.single('foto'), jugadorController.subirFotoJugador);

// Eliminar de forma permanente un jugador del sistema por su ID (Acción protegida).
router.delete('/:id', auth, jugadorController.eliminarJugador);

module.exports = router; // Exportamos el enrutador para ser utilizado en el servidor (app.js/index.js).