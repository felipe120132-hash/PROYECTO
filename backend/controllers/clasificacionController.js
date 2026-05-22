const db = require('../config/db');
// Controlador para obtener la tabla de clasificación
exports.obtenerTabla = async (req, res) => {
    const { temporada } = req.query;
// Validar que se haya proporcionado la temporada
    if (!temporada) {
        return res.status(400).json({ msg: 'Se requiere el parámetro temporada.' });
    }
// Consulta SQL para obtener la tabla de clasificación con los datos de los equipos
    try {
        const sql = `
            SELECT 
                e.id,
                e.nombre, 
                e.entrenador,
                e.logo,
                c.id        AS clas_id,
                c.equipo_id,
                c.puntos, 
                c.pj, 
                c.pg, 
                c.pe, 
                c.pp, 
                c.tf, 
                c.tc,
                (c.tf - c.tc) AS dif
            FROM equipos e
            INNER JOIN clasificacion c ON e.id = c.equipo_id
            WHERE c.temporada = ? 
            ORDER BY c.puntos DESC, (c.tf - c.tc) DESC, c.tf DESC
        `;
// Ejecutar la consulta y devolver los resultados
        const [rows] = await db.query(sql, [temporada]);
        res.json(rows);
    } catch (error) {
        console.error('Error en obtenerTabla:', error);
        res.status(500).json({ msg: 'Error al cargar la tabla.' });
    }
};

// Controlador para obtener todas las temporadas únicas registradas
exports.obtenerTemporadas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT temporada FROM clasificacion 
            UNION 
            SELECT DISTINCT temporada FROM partidos 
            ORDER BY temporada ASC
        `);
        // Mapear a una lista simple de strings
        const temporadas = rows.map(r => r.temporada).filter(Boolean);
        res.json(temporadas);
    } catch (error) {
        console.error('Error en obtenerTemporadas:', error);
        res.status(500).json({ msg: 'Error al obtener las temporadas.' });
    }
};