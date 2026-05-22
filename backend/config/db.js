const mysql = require('mysql2/promise');
//crear una conexión a la base de datos utilizando las variables de entorno
const pool = mysql.createPool({
    host: process.env.DB_HOST,//localhost
    user: process.env.DB_USER,//root
    password: process.env.DB_PASSWORD,//password
    database: process.env.DB_NAME,//mydb
    port: process.env.DB_PORT,//3306
    waitForConnections: true,//esperar a que haya conexiones disponibles
    connectionLimit: 10,//limite de conexiones simultaneas
    queueLimit: 0//sin limite de conexiones en espera
});
//exportar la conexión para que pueda ser utilizada en otras partes de la aplicación
module.exports = pool;