const mysql = require('mysql2');
// ✅ Cargar variables de entorno al inicio
require('dotenv').config();

// Configuración de la conexión a la base de datos usando un Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME, 
    waitForConnections: true, 
    connectionLimit: 10,
    queueLimit: 0
});

// Exportar la versión basada en promesas para usar async/await
module.exports = pool.promise();