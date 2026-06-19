require('dotenv').config();
const db = require('./config/db');

async function test() {
    try {
        const { rows: equipos } = await db.query('SELECT id FROM equipos LIMIT 2');
        if (equipos.length < 2) {
            console.log("No hay 2 equipos");
            process.exit();
        }
        await db.query(`
            INSERT INTO partidos (equipo_local_id, equipo_visitante_id, temporada, categoria, fecha, horario, lugar, jugado)
            VALUES ($1, $2, '2026-2', 'Sub-19', null, null, null, false)
        `, [equipos[0].id, equipos[1].id]);
        console.log("Insert ok");
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        process.exit();
    }
}
test();
