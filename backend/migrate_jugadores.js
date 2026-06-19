require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    const conn = await db.connect();
    try {
        console.log('🔄 Iniciando migración de estadísticas de jugadores...');
        await conn.query('BEGIN');

        // 1. Crear la tabla jugador_estadisticas si no existe
        await conn.query(`
            CREATE TABLE IF NOT EXISTS jugador_estadisticas (
                id SERIAL PRIMARY KEY,
                jugador_id INTEGER REFERENCES jugadores(id) ON DELETE CASCADE,
                temporada VARCHAR(255) NOT NULL,
                puntos_anotados INTEGER DEFAULT 0,
                UNIQUE(jugador_id, temporada)
            )
        `);
        console.log('✅ Tabla jugador_estadisticas creada/verificada.');

        // 2. Obtener temporadas actuales
        const { rows: temporadas } = await conn.query(`
            SELECT DISTINCT temporada FROM clasificacion 
            UNION SELECT DISTINCT temporada FROM partidos 
            ORDER BY temporada ASC
        `);
        const temporadasActivas = temporadas.map(t => t.temporada).filter(Boolean);
        console.log('📅 Temporadas detectadas:', temporadasActivas);

        // 3. Insertar registros en 0 para todos los jugadores en cada temporada activa
        const { rows: jugadores } = await conn.query('SELECT id FROM jugadores');
        let inserts = 0;

        for (const t of temporadasActivas) {
            for (const j of jugadores) {
                await conn.query(`
                    INSERT INTO jugador_estadisticas (jugador_id, temporada, puntos_anotados)
                    VALUES ($1, $2, 0)
                    ON CONFLICT (jugador_id, temporada) DO NOTHING
                `, [j.id, t]);
                inserts++;
            }
        }
        
        console.log(`✅ ${inserts} registros (o ignorados por conflicto) de inicialización en jugador_estadisticas procesados.`);

        await conn.query('COMMIT');
        console.log('🎉 Migración completada con éxito.');
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('❌ Error en la migración:', err);
    } finally {
        conn.release();
        process.exit(0);
    }
}

migrate();
