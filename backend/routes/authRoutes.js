//exportamos el router de autenticación para manejar las rutas relacionadas con el login
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
// Ruta para el login
router.post('/login', login);

module.exports = router;