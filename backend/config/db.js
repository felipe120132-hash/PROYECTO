const { Pool } = require('pg');

// Conexión a Supabase (PostgreSQL) usando variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a Supabase:', err.message);
  } else {
    console.log('✅ Conectado a Supabase correctamente');
    release();
  }
});

module.exports = pool;