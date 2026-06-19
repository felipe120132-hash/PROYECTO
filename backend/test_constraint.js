require('dotenv').config();
const db = require('./config/db');

async function test() {
    try {
        const { rows } = await db.query(`
            SELECT
                tc.constraint_name, tc.table_name, kcu.column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_name = 'partido_unico';
        `);
        console.log(rows);
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        process.exit();
    }
}
test();
