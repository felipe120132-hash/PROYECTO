require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log('🔄 Iniciando migración de categorías (sin transacciones)...');

        // 1. Agregar categoria a partidos
        try {
            await db.query(`ALTER TABLE partidos ADD COLUMN categoria VARCHAR(50) DEFAULT 'Profesional'`);
            console.log('✅ Columna categoria agregada a partidos.');
        } catch (e) {
            console.log('ℹ️ Columna categoria en partidos:', e.message);
        }

        // 2. Agregar categoria a clasificacion
        try {
            await db.query(`ALTER TABLE clasificacion ADD COLUMN categoria VARCHAR(50) DEFAULT 'Profesional'`);
            console.log('✅ Columna categoria agregada a clasificacion.');
        } catch (e) {
            console.log('ℹ️ Columna categoria en clasificacion:', e.message);
        }

        // 3. Modificar la restricción de unicidad de clasificacion si existe
        try {
            await db.query(`
                ALTER TABLE clasificacion 
                ADD CONSTRAINT clasificacion_equipo_temporada_categoria_key 
                UNIQUE (equipo_id, temporada, categoria)
            `);
            console.log('✅ Constraint de unicidad creado en clasificacion.');
        } catch (e) {
            console.log('ℹ️ Constraint de unicidad:', e.message);
        }

        // 4. Inscribir a los equipos existentes también en la categoría "Juvenil"
        const { rows: clasificacionActual } = await db.query(`
            SELECT equipo_id, temporada FROM clasificacion WHERE categoria = 'Profesional'
        `);
        
        let insertados = 0;
        for (const row of clasificacionActual) {
            try {
                await db.query(`
                    INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria)
                    VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, 'Juvenil')
                `, [row.equipo_id, row.temporada]);
                insertados++;
            } catch (e) {
                // Ignorar
            }
        }
        console.log(`✅ ${insertados} registros de categoría Juvenil creados en clasificación.`);

        console.log('🎉 Migración completada con éxito.');
    } catch (err) {
        console.error('❌ Error en la migración:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
