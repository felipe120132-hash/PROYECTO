const express = require('express'); // Importamos Express para la gestión de rutas.
const router = express.Router(); // Inicializamos el enrutador de Express.
const equipoController = require('../controllers/equipoController'); // Importamos el controlador que contiene la lógica para equipos.
const auth = require('../middlewares/authMiddleware'); // Importamos el middleware para proteger rutas mediante tokens.

//RUTAS DE EQUIPOS

// Obtener la lista de equipos filtrada por temporada (Público).
router.get('/', equipoController.getEquipos);

// Crear un nuevo equipo en la liga (Acción protegida para administradores).
router.post('/', auth, equipoController.createEquipo);

// Eliminar un equipo por su ID (Acción protegida para administradores).
router.delete('/:id', auth, equipoController.deleteEquipo);

// Actualizar el nombre del entrenador asignado a un equipo específico.
router.put('/:id', equipoController.actualizarEntrenador);

module.exports = router; // Exportamos el enrutador para ser montado en el servidor principal.