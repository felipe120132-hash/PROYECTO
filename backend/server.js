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

app.use(cors({
  origin: [
    'https://proyecto-pink-five.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/clasificacion', clasificacionRoutes);

app.post('/api/auth/login', authController.login);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});