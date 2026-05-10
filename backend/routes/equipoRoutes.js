const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
    }
});

const upload = multer({ storage: storage });

// RUTAS DE EQUIPOS

// Obtener la lista de equipos filtrada por temporada (Público).
router.get('/', equipoController.getEquipos);

// Crear un nuevo equipo en la liga (Acción protegida para administradores).
router.post('/', auth, equipoController.createEquipo);

// Eliminar un equipo por su ID (Acción protegida para administradores).
router.delete('/:id', auth, equipoController.deleteEquipo);

// Actualizar el nombre del entrenador asignado a un equipo específico.
router.put('/:id', equipoController.actualizarEntrenador);

// Actualizar el logo de un equipo específico mediante subida de archivo.
router.put('/:id/logo', auth, upload.single('logo'), equipoController.subirLogo);

module.exports = router;