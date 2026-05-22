const db = require('../config/db');

// Obtener jugadores por equipo
exports.obtenerJugadoresPorEquipo = async (req, res) => {
    const { equipoId } = req.params;
    try {
        const { rows } = await db.query(
            'SELECT id, nombre, categoria, puntos_anotados FROM jugadores WHERE equipo_id = $1',
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
    const { nombre, categoria, puntos_anotados } = req.body;

    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    try {
        const { rowCount } = await db.query(
            'UPDATE jugadores SET nombre = $1, categoria = $2, puntos_anotados = $3 WHERE id = $4',
            [nombre.trim(), categoria, puntos_anotados ?? 0, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }
        res.json({ message: '✅ Jugador actualizado.' });
    } catch (err) {
        console.error('[actualizarJugador]', err);
        res.status(500).json({ error: 'Error al actualizar jugador.' });
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