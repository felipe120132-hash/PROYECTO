require('dotenv').config();
const db = require('./config/db');

db.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'`)
  .then(r => {
    const relevant = r.rows.filter(row => ['jugadores', 'equipos', 'partidos', 'clasificacion'].includes(row.table_name));
    console.log(JSON.stringify(relevant, null, 2));
    process.exit(0);
  });
