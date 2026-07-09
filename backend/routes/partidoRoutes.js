const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const verificarToken = require('../middlewares/authMiddleware');

// ── RUTAS DE PARTIDOS ──────────────────────────────────────────────────────────

// Obtener la lista de partidos (Público)
router.get('/', partidoController.obtenerPartidos); 

// Crear un nuevo partido (Protegido)
router.post('/', verificarToken, partidoController.crearPartido);

// Actualizar el resultado de un partido existente (Protegido)
router.put('/resultado', verificarToken, partidoController.actualizarResultado);

// Editar los detalles de un partido (Protegido)
router.put('/:id', verificarToken, partidoController.editarPartido);

// Reiniciar toda la liga, borrando partidos (Protegido)
router.post('/reiniciar', verificarToken, partidoController.reiniciarLiga);

// Iniciar una nueva temporada conservando equipos y jugadores (Protegido)
router.post('/siguiente-temporada', verificarToken, partidoController.iniciarSiguienteTemporada);

// Eliminar todos los partidos de una temporada específica (Protegido)
router.delete('/temporada', verificarToken, partidoController.eliminarTemporada);

// Eliminar un partido por su ID (Protegido)
router.delete('/:id', verificarToken, partidoController.eliminarPartido);

module.exports = router;