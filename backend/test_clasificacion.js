require('dotenv').config();
const db = require('./config/db');

async function test() {
    const res = await db.query("SELECT * FROM clasificacion");
    console.log(res.rows);
    process.exit(0);
}
test();
