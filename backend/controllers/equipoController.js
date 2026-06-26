const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { eliminarEquipoHuerfano } = require('../helpers/equipoHelper');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

// Obtener equipos de una temporada
exports.getEquipos = async (req, res) => {
    const { temporada, categoria = 'Profesional' } = req.query;
    if (!temporada) return res.status(400).json({ msg: 'Se requiere el parámetro temporada.' });
    try {
        const { rows } = await db.query(`
            SELECT equipos.id, equipos.nombre, equipos.entrenador, equipos.logo,
                   c.id AS clas_id, c.equipo_id, c.pj, c.pg, c.pe, c.pp,
                   c.tf, c.tc, (c.tf - c.tc) AS dif, c.puntos, c.categoria
            FROM clasificacion c
            JOIN equipos ON equipos.id = c.equipo_id
            WHERE c.temporada = $1 AND c.categoria = $2
            ORDER BY c.puntos DESC, (c.tf - c.tc) DESC, c.tf DESC
        `, [temporada, categoria]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ msg: 'Error al obtener equipos.' });
    }
};

// Crear un nuevo equipo
exports.createEquipo = async (req, res) => {
    const { nombre, temporada, entrenador, categoria = 'Profesional' } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ msg: 'El nombre del equipo es obligatorio.' });
    if (!temporada) return res.status(400).json({ msg: 'La temporada es obligatoria.' });

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        const { rows: equipoRows } = await conn.query(
            'SELECT id FROM equipos WHERE nombre = $1', [nombre.trim()]
        );

        const equipoExistente = equipoRows[0];

        let equipoId;
        if (equipoExistente) {
            const { rows: tempRows } = await conn.query(
                'SELECT id FROM clasificacion WHERE equipo_id = $1 AND temporada = $2 AND categoria = $3',
                [equipoExistente.id, temporada, categoria]
            );
            if (tempRows[0]) {
                await conn.query('ROLLBACK');
                return res.status(409).json({ msg: 'Este equipo ya existe en esta temporada y categoría.' });
            }
            equipoId = equipoExistente.id;
        } else {
            let logoUrl = null;
            if (req.file) {
                const resultado = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'liga_baloncesto'
                });
                logoUrl = resultado.secure_url;
            }

            const { rows: insertRows } = await conn.query(
                'INSERT INTO equipos (nombre, entrenador, logo) VALUES ($1, $2, $3) RETURNING id',
                [nombre.trim(), entrenador || '', logoUrl]
            );
            equipoId = insertRows[0].id;
        }

        await conn.query(
            `INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria)
             VALUES ($1, 0, 0, 0, 0, 0, 0, 0, $2, $3)
             ON CONFLICT DO NOTHING`,
            [equipoId, temporada, categoria]
        );

        await conn.query('COMMIT');
        res.status(201).json({ msg: `Equipo registrado en la temporada ${temporada}.` });
    } catch (error) {
        await conn.query('ROLLBACK');
        console.error('Error al crear equipo:', error);
        res.status(500).json({ msg: 'Error al crear equipo.' });
    } finally {
        conn.release();
    }
};

// Eliminar equipo de una temporada
exports.deleteEquipo = async (req, res) => {
    const { id } = req.params;
    const { temporada, categoria } = req.query;
    if (!temporada) return res.status(400).json({ msg: 'Se requiere el parámetro temporada.' });
    if (!categoria) return res.status(400).json({ msg: 'Se requiere el parámetro categoria.' });

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        await conn.query(`
            DELETE FROM partidos 
            WHERE (equipo_local_id = $1 OR equipo_visitante_id = $1) 
              AND temporada = $2 AND categoria = $3
        `, [id, temporada, categoria]);

        await conn.query(
            'DELETE FROM clasificacion WHERE equipo_id = $1 AND temporada = $2 AND categoria = $3',
            [id, temporada, categoria]
        );

        await eliminarEquipoHuerfano(conn, id);

        await conn.query('COMMIT');
        res.json({ msg: 'Equipo eliminado de la temporada correctamente.' });

    } catch (error) {
        await conn.query('ROLLBACK');
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ msg: 'Error interno al intentar eliminar el equipo.' });
    } finally {
        conn.release();
    }
};

// Actualizar entrenador
exports.actualizarEntrenador = async (req, res) => {
    const { id } = req.params;
    const { entrenador } = req.body;
    try {
        await db.query('UPDATE equipos SET entrenador = $1 WHERE id = $2', [entrenador, id]);
        res.json({ success: true, message: 'Entrenador actualizado.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar entrenador.' });
    }
};

// Subir/actualizar logo con Cloudinary
exports.subirLogo = async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    try {
        const resultado = await cloudinary.uploader.upload(req.file.path, {
            folder: 'liga_baloncesto'
        });
        const logoUrl = resultado.secure_url;

        await db.query('UPDATE equipos SET logo = $1 WHERE id = $2', [logoUrl, id]);
        res.json({ success: true, logo: logoUrl });
    } catch (err) {
        console.error('❌ Error al subir a Cloudinary:', err);
        res.status(500).json({ error: 'Error al actualizar logo con Cloudinary.' });
    }
};