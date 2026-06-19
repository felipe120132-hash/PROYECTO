require('dotenv').config();
const db = require('./config/db');

async function seed() {
    const r = await db.query("SELECT equipo_id, temporada FROM clasificacion WHERE categoria = 'Profesional'");
    for (const row of r.rows) {
        await db.query(`
            INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria) 
            VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, 'Juvenil') 
            ON CONFLICT DO NOTHING
        `, [row.equipo_id, row.temporada]);
    }
    console.log('Insertados Juveniles');
    process.exit();
}
seed();
