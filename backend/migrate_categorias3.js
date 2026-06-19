require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log('🔄 Iniciando migración a nuevas categorías...');

        // 1. Rename 'Juvenil' to 'Sub-19' in clasificacion, partidos, and jugadores
        console.log('Actualizando Juvenil a Sub-19...');
        await db.query(`UPDATE clasificacion SET categoria = 'Sub-19' WHERE categoria = 'Juvenil'`);
        await db.query(`UPDATE partidos SET categoria = 'Sub-19' WHERE categoria = 'Juvenil'`);
        await db.query(`UPDATE jugadores SET categoria = 'Sub-19' WHERE categoria = 'Juvenil'`);
        console.log('✅ Juvenil renombrado a Sub-19.');

        // 2. Obtener equipos Profesionales
        const { rows: equipos } = await db.query(`
            SELECT equipo_id, temporada FROM clasificacion WHERE categoria = 'Profesional'
        `);

        // 3. Crear registros para Sub-15 y Sub-10
        let insertadosSub15 = 0;
        let insertadosSub10 = 0;

        for (const row of equipos) {
            // Sub-15
            try {
                await db.query(`
                    INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria)
                    VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, 'Sub-15')
                    ON CONFLICT DO NOTHING
                `, [row.equipo_id, row.temporada]);
                insertadosSub15++;
            } catch (e) {
                // Ignore
            }

            // Sub-10
            try {
                await db.query(`
                    INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria)
                    VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, 'Sub-10')
                    ON CONFLICT DO NOTHING
                `, [row.equipo_id, row.temporada]);
                insertadosSub10++;
            } catch (e) {
                // Ignore
            }
        }
        
        console.log(`✅ ${insertadosSub15} equipos insertados en Sub-15.`);
        console.log(`✅ ${insertadosSub10} equipos insertados en Sub-10.`);
        console.log('🎉 Migración de categorías completada con éxito.');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
