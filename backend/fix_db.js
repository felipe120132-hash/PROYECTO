require('dotenv').config();
const db = require('./config/db');

async function fix() {
    try {
        await db.query(`ALTER TABLE clasificacion DROP CONSTRAINT IF EXISTS uq_equipo_temporada`);
        console.log('Constraint uq_equipo_temporada borrado.');
        
        try {
            await db.query(`
                ALTER TABLE clasificacion 
                ADD CONSTRAINT uq_equipo_temporada_categoria 
                UNIQUE (equipo_id, temporada, categoria)
            `);
            console.log('Nuevo constraint uq_equipo_temporada_categoria creado.');
        } catch (e) {
            console.log('Constraint nuevo ya existía o error:', e.message);
        }

        const r = await db.query("SELECT equipo_id, temporada FROM clasificacion WHERE categoria = 'Profesional'");
        let insertados = 0;
        for (const row of r.rows) {
            try {
                await db.query(`
                    INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria) 
                    VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, 'Juvenil') 
                    ON CONFLICT DO NOTHING
                `, [row.equipo_id, row.temporada]);
                insertados++;
            } catch (e) {
                console.log("Error insertando juvenil", row.equipo_id, e.message);
            }
        }
        console.log(`Insertados ${insertados} equipos Juveniles en clasificacion.`);
    } catch (e) {
        console.log(e);
    } finally {
        process.exit();
    }
}
fix();
