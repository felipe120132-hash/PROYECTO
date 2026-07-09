/**
 * Controlador de Jugadores.
 * Administra la informacian de los jugadores, incluyendo fotos, estadasticas y MVP.
 */
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

// Obtener jugadores por equipo
exports.obtenerJugadoresPorEquipo = async (req, res) => {
    const { equipoId } = req.params;
    const { temporada, categoria = 'Profesional' } = req.query;
    try {
        let query;
        let params;
        
        if (temporada) {
            query = `
                SELECT j.id, j.nombre, j.categoria, j.foto, 
                       COALESCE(je.puntos_anotados, 0) AS puntos_anotados 
                FROM jugadores j
                LEFT JOIN jugador_estadisticas je ON j.id = je.jugador_id AND je.temporada = $2
                WHERE j.equipo_id = $1 AND j.categoria = $3
            `;
            params = [equipoId, temporada, categoria];
        } else {
            query = `
                SELECT j.id, j.nombre, j.categoria, j.foto, 
                       COALESCE(SUM(je.puntos_anotados), 0) AS puntos_anotados 
                FROM jugadores j
                LEFT JOIN jugador_estadisticas je ON j.id = je.jugador_id
                WHERE j.equipo_id = $1 AND j.categoria = $2
                GROUP BY j.id
            `;
            params = [equipoId, categoria];
        }

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('[obtenerJugadoresPorEquipo]', err);
        res.status(500).json({ error: 'Error al cargar la plantilla.' });
    }
};

// Agregar jugador
exports.agregarJugador = async (req, res) => {
    const { nombre, categoria, equipo_id, puntos_anotados, temporada } = req.body;

    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre del jugador es obligatorio.' });
    }
    if (!categoria || !categoria.trim()) {
        return res.status(400).json({ error: 'La categoría es obligatoria.' });
    }
    if (!equipo_id) {
        return res.status(400).json({ error: 'equipo_id es obligatorio.' });
    }

    try {
        const { rows } = await db.query(
            'INSERT INTO jugadores (nombre, categoria, equipo_id, puntos_anotados) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre.trim(), categoria.trim(), equipo_id, 0]
        );
        const jugadorId = rows[0].id;
        
        if (temporada) {
            await db.query(`
                INSERT INTO jugador_estadisticas (jugador_id, temporada, puntos_anotados) 
                VALUES ($1, $2, $3)
            `, [jugadorId, temporada, puntos_anotados || 0]);
        }

        res.status(201).json({ message: '✅ Jugador registrado.', id: jugadorId });
    } catch (err) {
        console.error('[agregarJugador]', err);
        res.status(500).json({ error: 'Error al registrar jugador.' });
    }
};

// Actualizar jugador
exports.actualizarJugador = async (req, res) => {
    const { id } = req.params;
    let { nombre, categoria, puntos_anotados, temporada } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM jugadores WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }
        const jugadorExistente = rows[0];

        const nombreFinal = (nombre !== undefined && nombre !== null) ? nombre.trim() : jugadorExistente.nombre;
        const categoriaFinal = (categoria !== undefined && categoria !== null) ? categoria : jugadorExistente.categoria;
        
        if (!nombreFinal) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }

        // Actualizar datos base del jugador
        await db.query(
            'UPDATE jugadores SET nombre = $1, categoria = $2 WHERE id = $3',
            [nombreFinal, categoriaFinal, id]
        );

        // Actualizar estadísticas de la temporada si se proporcionan
        if (puntos_anotados !== undefined && puntos_anotados !== null && temporada) {
            let ptsNum = parseInt(puntos_anotados) || 0;
            // Upsert en la tabla de estadísticas
            await db.query(`
                INSERT INTO jugador_estadisticas (jugador_id, temporada, puntos_anotados) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (jugador_id, temporada) 
                DO UPDATE SET puntos_anotados = $3
            `, [id, temporada, ptsNum]);
        }

        res.json({ message: '✅ Jugador actualizado.' });
    } catch (err) {
        console.error('[actualizarJugador]', err);
        res.status(500).json({ error: 'Error al actualizar jugador.' });
    }
};

// Sumar puntos a jugador
exports.sumarPuntosJugador = async (req, res) => {
    const { id } = req.params;
    const { puntos_anotados, temporada } = req.body;

    if (puntos_anotados === undefined || puntos_anotados === null || !temporada) {
        return res.status(400).json({ error: 'Faltan datos de puntos o temporada.' });
    }

    try {
        let ptsNum = parseInt(puntos_anotados) || 0;
        
        const { rows: statRows } = await db.query(
            'SELECT puntos_anotados FROM jugador_estadisticas WHERE jugador_id = $1 AND temporada = $2', 
            [id, temporada]
        );
        let puntosActuales = statRows.length > 0 ? statRows[0].puntos_anotados : 0;
        ptsNum += puntosActuales;

        // Upsert en la tabla de estadísticas
        await db.query(`
            INSERT INTO jugador_estadisticas (jugador_id, temporada, puntos_anotados) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (jugador_id, temporada) 
            DO UPDATE SET puntos_anotados = $3
        `, [id, temporada, ptsNum]);

        res.json({ message: '✅ Puntos del jugador actualizados.' });
    } catch (err) {
        console.error('[sumarPuntosJugador]', err);
        res.status(500).json({ error: 'Error al sumar puntos del jugador.' });
    }
};

// Subir/actualizar foto del jugador con Cloudinary
exports.subirFotoJugador = async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    try {
        // Verificar si el jugador ya tiene foto para eliminarla de Cloudinary
        const { rows } = await db.query('SELECT foto FROM jugadores WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Jugador no encontrado.' });

        const resultado = await cloudinary.uploader.upload(req.file.path, {
            folder: 'liga_baloncesto/jugadores',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
        });
        const fotoUrl = resultado.secure_url;

        await db.query('UPDATE jugadores SET foto = $1 WHERE id = $2', [fotoUrl, id]);
        res.json({ success: true, foto: fotoUrl });
    } catch (err) {
        console.error('[subirFotoJugador]', err);
        res.status(500).json({ error: 'Error al subir foto del jugador.' });
    }
};

// Eliminar jugador
exports.eliminarJugador = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query(
            'DELETE FROM jugadores WHERE id = $1', [id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }
        res.json({ message: '✅ Jugador eliminado.' });
    } catch (err) {
        console.error('[eliminarJugador]', err);
        res.status(500).json({ error: 'Error al eliminar jugador.' });
    }
};

// Obtener MVP
exports.obtenerMVP = async (req, res) => {
    const { temporada, categoria } = req.query;
    if (!temporada || !categoria) {
        return res.status(400).json({ error: 'temporada y categoria son requeridos' });
    }
    try {
        const query = `
            SELECT j.id, j.nombre, j.categoria, j.foto, 
                   je.puntos_anotados, e.nombre AS equipo_nombre
            FROM jugadores j
            JOIN jugador_estadisticas je ON j.id = je.jugador_id
            LEFT JOIN equipos e ON j.equipo_id = e.id
            WHERE je.temporada = $1 AND j.categoria = $2 AND je.puntos_anotados > 0
            ORDER BY je.puntos_anotados DESC
            LIMIT 1
        `;
        const { rows } = await db.query(query, [temporada, categoria]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró MVP para la temporada/categoría.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('[obtenerMVP]', err);
        res.status(500).json({ error: 'Error al obtener MVP.' });
    }
};