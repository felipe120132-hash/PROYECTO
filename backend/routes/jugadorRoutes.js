const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const auth = require('../middlewares/authMiddleware');
const { upload, uploadErrorHandler } = require('../middlewares/upload');

// ── RUTAS DE JUGADORES ────────────────────────────────────────────────────────

// Obtener todos los jugadores de un equipo (Público).
router.get('/equipo/:equipoId', jugadorController.obtenerJugadoresPorEquipo);

// Registrar un nuevo jugador (protegido).
router.post('/', auth, jugadorController.agregarJugador);

// Actualizar datos de un jugador (protegido).
router.put('/:id', auth, jugadorController.actualizarJugador);

// Actualizar puntos de un jugador (protegido).
router.put('/:id/puntos', auth, jugadorController.sumarPuntosJugador);

// Subir/actualizar foto del jugador (protegido).
router.put('/:id/foto', auth, upload.single('foto'), jugadorController.subirFotoJugador);

// Eliminar un jugador (protegido).
router.delete('/:id', auth, jugadorController.eliminarJugador);

// MVP endpoint (Público)
router.get('/mvp', jugadorController.obtenerMVP);

// Manejo de errores de multer
router.use(uploadErrorHandler);

module.exports = router;