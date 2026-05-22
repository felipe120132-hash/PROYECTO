const express = require('express'); // Importamos Express para la gestión de rutas.
const router = express.Router(); // Inicializamos el enrutador de Express.
const clasificacionController = require('../controllers/clasificacionController'); // Importamos el controlador que contiene la lógica de negocio para la tabla de posiciones.

// ── RUTA: OBTENER TABLA DE POSICIONES ─────────────────────────────────────────
// Define la ruta base para obtener los datos de la tabla (PJ, PG, PE, PP, Puntos, etc.).
// Esta ruta es pública para que cualquier usuario pueda ver las estadísticas de la liga.
router.get('/', clasificacionController.obtenerTabla);
router.get('/temporadas', clasificacionController.obtenerTemporadas);

module.exports = router; // Exportamos el enrutador para que pueda ser montado en el servidor principal