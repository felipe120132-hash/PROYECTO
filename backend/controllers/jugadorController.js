const db = require('../config/db'); // Importamos la configuración de la base de datos para ejecutar consultas SQL.

// Controlador para obtener la lista de jugadores que pertenecen a un equipo específico.
exports.obtenerJugadoresPorEquipo = async (req, res) => {
    const { equipoId } = req.params; // Obtenemos el ID del equipo desde los parámetros de la URL.
    try {
        // Realizamos la consulta para obtener los datos básicos y puntos del jugador.
        const [rows] = await db.query(
            'SELECT id, nombre, categoria, Puntos_anotados AS puntos_anotados FROM jugadores WHERE equipo_id = ?',
            [equipoId]
        );
        res.json(rows); // Devolvemos la lista de jugadores en formato JSON.
    } catch (err) {
        console.error('[obtenerJugadoresPorEquipo]', err);
        res.status(500).json({ error: 'Error al cargar la plantilla.' });
    }
};

// Controlador para registrar un nuevo jugador en la base de datos.
exports.agregarJugador = async (req, res) => {
    const { nombre, categoria, equipo_id, puntos_anotados } = req.body; // Extraemos los datos del cuerpo de la petición.

    // Validaciones de seguridad: el nombre, categoría y el ID del equipo son obligatorios.
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
        // Insertamos el jugador. Usamos trim() para evitar espacios accidentales y 0 como valor por defecto de puntos.
        const [result] = await db.query(
            'INSERT INTO jugadores (nombre, categoria, equipo_id, Puntos_anotados) VALUES (?, ?, ?, ?)',
            [nombre.trim(), categoria.trim(), equipo_id, puntos_anotados || 0]
        );
        // Devolvemos éxito con el ID generado automáticamente.
        res.status(201).json({ message: '✅ Jugador registrado.', id: result.insertId });
    } catch (err) {
        console.error('[agregarJugador]', err);
        // Se envía el mensaje de error de SQL si existe para facilitar el debug.
        res.status(500).json({ error: err.sqlMessage || 'Error al registrar jugador.' });
    }
};

// Controlador para editar la información de un jugador existente.
exports.actualizarJugador = async (req, res) => {
    const { id } = req.params; // ID del jugador a actualizar.
    const { nombre, categoria, puntos_anotados } = req.body;

    // El nombre sigue siendo obligatorio para evitar registros vacíos.
    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    try {
        // Ejecutamos la actualización. El operador ?? asegura que si puntos_anotados es null/undefined, se use 0.
        const [result] = await db.query(
            'UPDATE jugadores SET nombre = ?, categoria = ?, Puntos_anotados = ? WHERE id = ?',
            [nombre.trim(), categoria, puntos_anotados ?? 0, id]
        );
        // Verificamos si se encontró el jugador por su ID.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }
        res.json({ message: '✅ Jugador actualizado.' });
    } catch (err) {
        console.error('[actualizarJugador]', err);
        res.status(500).json({ error: 'Error al actualizar jugador.' });
    }
};
// Controlador para dar de baja a un jugador de la base de datos.
exports.eliminarJugador = async (req, res) => {
    const { id } = req.params; // ID del jugador a eliminar.
    try {
        const [result] = await db.query('DELETE FROM jugadores WHERE id = ?', [id]);
        // Si no se borró nada, significa que el ID no existe.
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }
        res.json({ message: '✅ Jugador eliminado.' });
    } catch (err) {
        console.error('[eliminarJugador]', err);
        res.status(500).json({ error: 'Error al eliminar jugador.' });
    }
};