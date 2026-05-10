const db = require('../config/db');

// Controlador para obtener los equipos de una temporada específica
exports.getEquipos = async (req, res) => {
    const { temporada } = req.query;
    if (!temporada) return res.status(400).json({ msg: 'Se requiere el parámetro temporada.' });
    try {
        const [rows] = await db.query(`
            SELECT equipos.id, equipos.nombre, equipos.entrenador, equipos.logo,
                   c.id AS clas_id, c.equipo_id, c.pj, c.pg, c.pe, c.pp,
                   c.tf, c.tc, (c.tf - c.tc) AS dif, c.puntos
            FROM clasificacion c
            JOIN equipos ON equipos.id = c.equipo_id
            WHERE c.temporada = ?
            ORDER BY c.puntos DESC, (c.tf - c.tc) DESC, c.tf DESC
        `, [temporada]);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error al obtener equipos:', error);
        res.status(500).json({ msg: 'Error al obtener equipos', error });
    }
};

// Controlador para crear un nuevo equipo en una temporada específica
exports.createEquipo = async (req, res) => {
    const { nombre, temporada } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ msg: 'El nombre del equipo es obligatorio.' });
    if (!temporada) return res.status(400).json({ msg: 'La temporada es obligatoria.' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[equipoExistente]] = await conn.query(
            'SELECT id FROM equipos WHERE nombre = ?', [nombre.trim()]
        );

        let equipoId; 
        if (equipoExistente) {
            const [[yaEnTemporada]] = await conn.query(
                'SELECT id FROM clasificacion WHERE equipo_id = ? AND temporada = ?',
                [equipoExistente.id, temporada]
            );
            if (yaEnTemporada) {
                await conn.rollback();
                return res.status(409).json({ msg: 'Este equipo ya existe en esta temporada.' });
            }
            equipoId = equipoExistente.id;
        } else {
            const [result] = await conn.query(
                'INSERT INTO equipos (nombre, entrenador) VALUES (?, ?)', [nombre.trim(), '']
            );
            equipoId = result.insertId;
        }

        await conn.query(
            `INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada)
             VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?)`,
            [equipoId, temporada]
        );

        await conn.commit();
        res.status(201).json({ msg: `Equipo registrado en la temporada ${temporada}.` });
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error al crear equipo:', error);
        res.status(500).json({ msg: 'Error al crear equipo.', error: error.sqlMessage });
    } finally {
        conn.release();
    }
};

// Controlador para eliminar un equipo de una temporada específica
exports.deleteEquipo = async (req, res) => {
    const { id } = req.params;
    const { temporada } = req.query;
    if (!temporada) return res.status(400).json({ msg: 'Se requiere el parámetro temporada.' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('SET SQL_SAFE_UPDATES = 0');
        await conn.query(`
            DELETE FROM partidos 
            WHERE (equipo_local_id = ? OR equipo_visitante_id = ?) 
              AND temporada = ?
        `, [id, id, temporada]);

        await conn.query(
            'DELETE FROM clasificacion WHERE equipo_id = ? AND temporada = ?',
            [id, temporada]
        );

        const [[{ otras }]] = await conn.query(
            'SELECT COUNT(*) AS otras FROM clasificacion WHERE equipo_id = ?', [id]
        );

        if (otras === 0) {
            await conn.query('DELETE FROM jugadores WHERE equipo_id = ?', [id]);
            await conn.query('DELETE FROM equipos WHERE id = ?', [id]);
        }

        await conn.query('SET SQL_SAFE_UPDATES = 1');
        await conn.commit();
        res.json({ msg: 'Equipo eliminado de la temporada correctamente.' });

    } catch (error) {
        await conn.rollback();
        console.error('❌ Error detallado al eliminar equipo:', error);
        res.status(500).json({
            msg: 'Error interno al intentar eliminar el equipo.',
            error: error.sqlMessage || error.message
        });
    } finally {
        conn.release();
    }
};

// Controlador para actualizar el entrenador de un equipo
exports.actualizarEntrenador = async (req, res) => {
    const { id } = req.params;
    const { entrenador } = req.body;
    try {
        await db.query('UPDATE equipos SET entrenador = ? WHERE id = ?', [entrenador, id]);
        res.json({ success: true, message: 'Entrenador actualizado.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar entrenador.' });
    }
};

// Controlador para subir el logo (archivo)
exports.subirLogo = async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const logoUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    try {
        await db.query('UPDATE equipos SET logo = ? WHERE id = ?', [logoUrl, id]);
        res.json({ success: true, logo: logoUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar logo.' });
    }
};