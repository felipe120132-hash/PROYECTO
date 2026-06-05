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
    try {
        const { rows } = await db.query(
            'SELECT id, nombre, categoria, puntos_anotados, foto FROM jugadores WHERE equipo_id = $1',
            [equipoId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[obtenerJugadoresPorEquipo]', err);
        res.status(500).json({ error: 'Error al cargar la plantilla.' });
    }
};

// Agregar jugador
exports.agregarJugador = async (req, res) => {
    const { nombre, categoria, equipo_id, puntos_anotados } = req.body;

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
            [nombre.trim(), categoria.trim(), equipo_id, puntos_anotados || 0]
        );
        res.status(201).json({ message: '✅ Jugador registrado.', id: rows[0].id });
    } catch (err) {
        console.error('[agregarJugador]', err);
        res.status(500).json({ error: err.message || 'Error al registrar jugador.' });
    }
};

// Actualizar jugador
exports.actualizarJugador = async (req, res) => {
    const { id } = req.params;
    let { nombre, categoria, puntos_anotados } = req.body;

    try {
        // Consultar el jugador existente primero
        const { rows } = await db.query('SELECT * FROM jugadores WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }
        const jugadorExistente = rows[0];

        // Usar los valores existentes si no se proveen en el cuerpo de la petición
        const nombreFinal = (nombre !== undefined && nombre !== null) ? nombre.trim() : jugadorExistente.nombre;
        const categoriaFinal = (categoria !== undefined && categoria !== null) ? categoria : jugadorExistente.categoria;
        
        let puntosFinal = jugadorExistente.puntos_anotados || 0;
        if (puntos_anotados !== undefined && puntos_anotados !== null) {
            if (nombre === undefined) {
                // Sumar puntos del partido
                puntosFinal += parseInt(puntos_anotados) || 0;
            } else {
                // Sobrescribir (panel de edición normal)
                puntosFinal = parseInt(puntos_anotados) || 0;
            }
        }

        if (!nombreFinal) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }

        await db.query(
            'UPDATE jugadores SET nombre = $1, categoria = $2, puntos_anotados = $3 WHERE id = $4',
            [nombreFinal, categoriaFinal, puntosFinal, id]
        );
        res.json({ message: '✅ Jugador actualizado.' });
    } catch (err) {
        console.error('[actualizarJugador]', err);
        res.status(500).json({ error: 'Error al actualizar jugador.' });
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