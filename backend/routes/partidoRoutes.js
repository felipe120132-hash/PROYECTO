const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', partidoController.obtenerPartidos); 
router.post('/', verificarToken, partidoController.crearPartido);
router.put('/resultado', verificarToken, partidoController.actualizarResultado);
router.put('/:id', verificarToken, partidoController.editarPartido);
router.post('/reiniciar', verificarToken, partidoController.reiniciarLiga);
router.post('/siguiente-temporada', verificarToken, partidoController.iniciarSiguienteTemporada);

router.delete('/temporada', verificarToken, partidoController.eliminarTemporada);
router.delete('/:id', verificarToken, partidoController.eliminarPartido);

module.exports = router;