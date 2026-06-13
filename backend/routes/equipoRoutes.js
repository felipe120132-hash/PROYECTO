const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// ── Multer: solo imágenes, máximo 5 MB ───────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WEBP, GIF).'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

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
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo supera el límite de 5 MB.' });
    }
    if (err.message && err.message.includes('Tipo de archivo')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

module.exports = router;