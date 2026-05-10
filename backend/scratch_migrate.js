const db = require('./config/db');

async function migrate() {
    try {
        console.log('--- Iniciando migración ---');
        
        try {
            await db.query('ALTER TABLE equipos ADD COLUMN logo VARCHAR(255) DEFAULT NULL');
            console.log('✅ Columna "logo" agregada.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ La columna "logo" ya existe.');
            } else {
                throw err;
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la migración:', err);
        process.exit(1);
    }
}

migrate();
