const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const auth = require('../middlewares/authMiddleware');
const { upload, uploadErrorHandler } = require('../middlewares/upload');

// ── RUTAS DE EQUIPOS ──────────────────────────────────────────────────────────

// Obtener la lista de equipos filtrada por temporada (Público).
router.get('/', equipoController.getEquipos);

// Crear un nuevo equipo (protegido).
router.post('/', auth, upload.single('logo'), equipoController.createEquipo);

// Eliminar un equipo por su ID (protegido).
router.delete('/:id', auth, equipoController.deleteEquipo);

// Actualizar el entrenador de un equipo (protegido — CORREGIDO: faltaba auth).
router.put('/:id', auth, equipoController.actualizarEntrenador);

// Actualizar el logo de un equipo (protegido).
router.put('/:id/logo', auth, upload.single('logo'), equipoController.subirLogo);

// Manejo de errores de multer
router.use(uploadErrorHandler);

module.exports = router;