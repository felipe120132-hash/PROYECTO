require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ── Verificación de variables de entorno críticas ─────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('=========================================================');
  console.error('ERROR CRÍTICO: JWT_SECRET no está configurado.');
  console.error('El login NO funcionará. Configurá esta variable en Render.');
  console.error('=========================================================');
}

const equipoRoutes = require('./routes/equipoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const clasificacionRoutes = require('./routes/clasificacionRoutes');
const authController = require('./controllers/authController');

const app = express();

// ── Seguridad: cabeceras HTTP estándar (protección contra XSS, clickjacking, etc.) ──
app.use(helmet());

// ── CORS: solo orígenes conocidos permitidos ─────────────────────────────────
app.use(cors({
  origin: [
    'https://proyecto-pink-five.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limitar tamaño del body JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate limiting en login: máximo 10 intentos por IP cada 15 minutos ────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Demasiados intentos de inicio de sesión. Intentá de nuevo en 15 minutos.' },
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/clasificacion', clasificacionRoutes);

app.post('/api/auth/login', loginLimiter, authController.login);

// ── Arranque ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});