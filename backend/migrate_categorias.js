require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    const conn = await db.connect();
    try {
        console.log('🔄 Iniciando migración de categorías...');
        await conn.query('BEGIN');

        // 1. Agregar categoria a partidos
        try {
            await conn.query(`ALTER TABLE partidos ADD COLUMN categoria VARCHAR(50) DEFAULT 'Profesional'`);
            console.log('✅ Columna categoria agregada a partidos.');
        } catch (e) {
            if (e.code === '42701') console.log('ℹ️ Columna categoria ya existe en partidos.');
            else throw e;
        }

        // 2. Agregar categoria a clasificacion
        try {
            await conn.query(`ALTER TABLE clasificacion ADD COLUMN categoria VARCHAR(50) DEFAULT 'Profesional'`);
            console.log('✅ Columna categoria agregada a clasificacion.');
        } catch (e) {
            if (e.code === '42701') console.log('ℹ️ Columna categoria ya existe en clasificacion.');
            else throw e;
        }

        // 3. Modificar la restricción de unicidad de clasificacion si existe
        // En PostgreSQL no podemos simplemente ALTER CONSTRAINT, hay que borrarla y crearla de nuevo.
        // Asumiendo que la combinación equipo_id + temporada era única (o no lo era y queremos que lo sea con categoria).
        // Si no había restricción, simplemente creamos un índice único.
        
        try {
            // Intentar crear un constraint único compuesto
            await conn.query(`
                ALTER TABLE clasificacion 
                ADD CONSTRAINT clasificacion_equipo_temporada_categoria_key 
                UNIQUE (equipo_id, temporada, categoria)
            `);
            console.log('✅ Constraint de unicidad creado en clasificacion.');
        } catch (e) {
            // Error 42P07: constraint already exists
            if (e.code === '42P07' || e.code === '42710') console.log('ℹ️ Constraint de unicidad ya existe.');
            else console.log('⚠️ No se pudo crear constraint de unicidad (puede que ya exista o haya duplicados):', e.message);
        }

        // 4. Inscribir a los equipos existentes también en la categoría "Juvenil"
        // para que arranquen con 0 puntos.
        const { rows: clasificacionActual } = await conn.query(`
            SELECT equipo_id, temporada FROM clasificacion WHERE categoria = 'Profesional'
        `);
        
        let insertados = 0;
        for (const row of clasificacionActual) {
            try {
                await conn.query(`
                    INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria)
                    VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, 'Juvenil')
                `, [row.equipo_id, row.temporada]);
                insertados++;
            } catch (e) {
                // Ignorar si ya existe
            }
        }
        console.log(`✅ ${insertados} registros de categoría Juvenil creados en clasificación.`);

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
