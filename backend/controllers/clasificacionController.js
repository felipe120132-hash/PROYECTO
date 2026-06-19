const db = require('../config/db');

// Obtener tabla de clasificación
exports.obtenerTabla = async (req, res) => {
    const { temporada, categoria = 'Profesional' } = req.query;

    if (!temporada) {
        return res.status(400).json({ msg: 'Se requiere el parámetro temporada.' });
    }

    try {
        const { rows } = await db.query(`
            SELECT 
                e.id, e.nombre, e.entrenador, e.logo,
                c.id AS clas_id, c.equipo_id, c.puntos,
                c.pj, c.pg, c.pe, c.pp, c.tf, c.tc,
                (c.tf - c.tc) AS dif, c.categoria
            FROM equipos e
            INNER JOIN clasificacion c ON e.id = c.equipo_id
            WHERE c.temporada = $1 AND c.categoria = $2
            ORDER BY c.puntos DESC, (c.tf - c.tc) DESC, c.tf DESC
        `, [temporada, categoria]);
        res.json(rows);
    } catch (error) {
        console.error('Error en obtenerTabla:', error);
        res.status(500).json({ msg: 'Error al cargar la tabla.' });
    }
};

// Obtener todas las temporadas
exports.obtenerTemporadas = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT DISTINCT temporada FROM clasificacion 
            UNION 
            SELECT DISTINCT temporada FROM partidos 
            ORDER BY temporada ASC
        `);
        const temporadas = rows.map(r => r.temporada).filter(Boolean);
        res.json(temporadas);
    } catch (error) {
        console.error('Error en obtenerTemporadas:', error);
        res.status(500).json({ msg: 'Error al obtener las temporadas.' });
    }
};