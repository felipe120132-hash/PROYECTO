require('dotenv').config();
const db = require('./config/db');

async function fixConstraint() {
    try {
        console.log("Dropping old constraint...");
        await db.query(`ALTER TABLE partidos DROP CONSTRAINT IF EXISTS partido_unico`);
        console.log("Old constraint dropped.");

        console.log("Creating new constraint...");
        await db.query(`
            ALTER TABLE partidos 
            ADD CONSTRAINT partido_unico 
            UNIQUE (equipo_local_id, equipo_visitante_id, temporada, categoria)
        `);
        console.log("New constraint created successfully.");
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        process.exit();
    }
}
fixConstraint();
