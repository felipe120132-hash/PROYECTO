require('dotenv').config();
const db = require('./config/db');

const randomNames = [
    "Mateo", "Santiago", "Matias", "Sebastian", "Tomas", "Lucas", "Nicolas", "Alejandro", 
    "Samuel", "Diego", "Daniel", "Joaquin", "Emilio", "Gabriel", "Benjamin", "Felipe", 
    "Martin", "Juan", "Agustin", "David", "Andres", "Jose", "Ignacio", "Facundo", 
    "Maximiliano", "Leonardo", "Rodrigo", "Cristian", "Emanuel", "Thiago", "Bautista", 
    "Gael", "Izan", "Bruno", "Ian", "Enzo", "Camilo", "Dante", "Geronimo", "Lautaro"
];

const randomLastNames = [
    "Gonzalez", "Rodriguez", "Gomez", "Fernandez", "Lopez", "Diaz", "Martinez", "Perez", 
    "Garcia", "Sanchez", "Romero", "Sosa", "Alvarez", "Torres", "Ruiz", "Ramirez", 
    "Flores", "Acosta", "Benitez", "Medina", "Suarez", "Herrera", "Aguilar", "Castro", 
    "Rojas", "Gimenez", "Silva", "Dominguez", "Rios", "Molina", "Ortiz", "Luna", 
    "Cabrera", "Rios", "Morales", "Castillo", "Villalba", "Ferreyra", "Cruz", "Guzman"
];

function getRandomName() {
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    const lastName = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
    return `${name} ${lastName}`;
}

async function seed() {
    try {
        console.log("Obteniendo equipos...");
        // Obtener los equipos. Podemos asumir que todos los equipos participan en juvenil,
        // o podemos obtener los equipos de la clasificación juvenil.
        const resEquipos = await db.query("SELECT DISTINCT equipo_id FROM clasificacion WHERE categoria = 'Juvenil'");
        const equiposIds = resEquipos.rows.map(row => row.equipo_id);
        
        console.log(`Se encontraron ${equiposIds.length} equipos juveniles.`);
        
        for (const equipo_id of equiposIds) {
            console.log(`Insertando jugadores para equipo ID: ${equipo_id}`);
            for (let i = 0; i < 5; i++) {
                const nombre = getRandomName();
                await db.query(`
                    INSERT INTO jugadores (equipo_id, nombre, categoria, puntos_anotados) 
                    VALUES ($1, $2, 'Juvenil', 0)
                `, [equipo_id, nombre]);
            }
        }
        
        console.log('Se insertaron 5 jugadores aleatorios por equipo con éxito en la categoría Juvenil.');
    } catch (err) {
        console.error("Error insertando jugadores:", err);
    } finally {
        process.exit(0);
    }
}

seed();
