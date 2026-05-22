const express = require('express'); // Importamos Express para la gestión de rutas.
const router = express.Router(); // Inicializamos el enrutador de Express.
const partidoController = require('../controllers/partidoController'); // Importamos el controlador de partidos.
const verificarToken = require('../middlewares/authMiddleware'); // Importamos el middleware de autenticación (verificarToken).

// RUTAS DE PARTIDOS 

// Obtener la lista de partidos, generalmente filtrados por el query param 'temporada' (Público).
router.get('/', partidoController.obtenerPartidos); 

// Crear un nuevo partido en estado pendiente (Acción protegida).
router.post('/', verificarToken, partidoController.crearPartido);

// Registrar el marcador de un partido y actualizar la tabla de clasificación (Acción protegida).
router.put('/resultado', verificarToken, partidoController.actualizarResultado);

// Editar únicamente los datos logísticos (fecha, horario, lugar) de un partido existente (Acción protegida).
router.put('/:id', verificarToken, partidoController.editarPartido);

// Reiniciar los resultados de todos los partidos de una temporada y resetear la clasificación (Acción protegida).
router.post('/reiniciar', verificarToken, partidoController.reiniciarLiga);

// Iniciar la temporada siguiente agregándola a la lista (Acción protegida).
router.post('/siguiente-temporada', verificarToken, partidoController.iniciarSiguienteTemporada);

// Eliminar un partido individual y, si ya fue jugado, recalcular la clasificación (Acción protegida).
router.delete('/:id', verificarToken, partidoController.eliminarPartido);

module.exports = router; // Exportamos el enrutador para ser montado en app.js.