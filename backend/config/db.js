const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a Supabase:', err.message);
  } else {
    console.log('✅ Conectado a Supabase correctamente');
    release();
  }
});

module.exports = pool;