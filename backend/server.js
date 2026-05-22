require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const equipoRoutes = require('./routes/equipoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const clasificacionRoutes = require('./routes/clasificacionRoutes');
const authController = require('./controllers/authController');

const app = express();

// CORS explícito antes de todo
app.use(cors({
  origin: [
    'https://proyecto-pink-five.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Preflight para todas las rutas
app.options('/(.*)', cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// RUTAS
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/clasificacion', clasificacionRoutes);

// AUTH usando la BD
app.post('/api/auth/login', authController.login);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});