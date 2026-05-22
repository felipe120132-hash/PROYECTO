const db = require('../config/db');

// se obtiene la lista de partidos para una temporada específica, incluyendo los nombres de los equipos local y visitante para facilitar la visualización en el frontend.
const sincronizarClasificacion = async (conn, temporada) => {
    await conn.query(`
        UPDATE clasificacion c 
        SET
            pj = (
                SELECT COUNT(*) FROM partidos
                WHERE (equipo_local_id = c.equipo_id OR equipo_visitante_id = c.equipo_id)
                  AND jugado = 1 AND temporada = c.temporada
            ),
            pg = (
                SELECT COUNT(*) FROM partidos
                WHERE ((equipo_local_id = c.equipo_id AND puntos_local > puntos_visitante)
                    OR (equipo_visitante_id = c.equipo_id AND puntos_visitante > puntos_local))
                  AND jugado = 1 AND temporada = c.temporada
            ),
            pe = (
                SELECT COUNT(*) FROM partidos
                WHERE (equipo_local_id = c.equipo_id OR equipo_visitante_id = c.equipo_id)
                  AND puntos_local = puntos_visitante AND jugado = 1 AND temporada = c.temporada
            ),
            pp = (
                SELECT COUNT(*) FROM partidos
                WHERE ((equipo_local_id = c.equipo_id AND puntos_local < puntos_visitante)
                    OR (equipo_visitante_id = c.equipo_id AND puntos_visitante < puntos_local))
                  AND jugado = 1 AND temporada = c.temporada
            ),
            tf = (
                SELECT COALESCE(SUM(
                    CASE WHEN equipo_local_id = c.equipo_id THEN puntos_local ELSE puntos_visitante END
                ), 0) FROM partidos
                WHERE (equipo_local_id = c.equipo_id OR equipo_visitante_id = c.equipo_id)
                  AND jugado = 1 AND temporada = c.temporada
            ),
            tc = (
                SELECT COALESCE(SUM(
                    CASE WHEN equipo_local_id = c.equipo_id THEN puntos_visitante ELSE puntos_local END
                ), 0) FROM partidos
                WHERE (equipo_local_id = c.equipo_id OR equipo_visitante_id = c.equipo_id)
                  AND jugado = 1 AND temporada = c.temporada
            ),
            puntos = (
                (SELECT COUNT(*) FROM partidos
                 WHERE ((equipo_local_id = c.equipo_id AND puntos_local > puntos_visitante)
                     OR (equipo_visitante_id = c.equipo_id AND puntos_visitante > puntos_local))
                   AND jugado = 1 AND temporada = c.temporada) * 3
                +
                (SELECT COUNT(*) FROM partidos
                 WHERE (equipo_local_id = c.equipo_id OR equipo_visitante_id = c.equipo_id)
                   AND puntos_local = puntos_visitante AND jugado = 1 AND temporada = c.temporada)
            )
        WHERE c.temporada = ?
    `, [temporada]);
};

// se obtiene la lista de partidos para una temporada específica, incluyendo los nombres de los equipos local y visitante para facilitar la visualización en el frontend.
exports.obtenerPartidos = async (req, res) => {
    const { temporada = '2026-1' } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.jugado,
                p.puntos_local,
                p.puntos_visitante,
                p.temporada,
                p.fecha,
                p.horario,
                p.lugar,
                p.equipo_local_id,
                p.equipo_visitante_id,
                e1.nombre AS nombre_local,
                e1.logo AS logo_local,
                e2.nombre AS nombre_visitante,
                e2.logo AS logo_visitante
            FROM partidos p
            JOIN equipos e1 ON p.equipo_local_id    = e1.id
            JOIN equipos e2 ON p.equipo_visitante_id = e2.id
            WHERE p.temporada = ?
            ORDER BY p.fecha ASC, p.horario ASC
        `, [temporada]);
        res.json(rows);
    } catch (err) {
        console.error('[obtenerPartidos]', err);
        res.status(500).json({ error: 'Error al obtener los partidos.' });
    }
};

// se crea un nuevo partido, asegurando que no se dupliquen enfrentamientos para la misma temporada y que un equipo no pueda ser local y visitante al mismo tiempo.
exports.crearPartido = async (req, res) => {
    const { equipo_local_id, equipo_visitante_id, temporada, fecha = null, horario = null, lugar = null } = req.body;

    if (Number(equipo_local_id) === Number(equipo_visitante_id)) {
        return res.status(400).json({ msg: 'Un equipo no puede ser local y visitante al mismo tiempo.' });
    }

    if (!equipo_local_id || !equipo_visitante_id || !temporada) {
        return res.status(400).json({ msg: 'equipo_local_id, equipo_visitante_id y temporada son obligatorios.' });
    }

    try {
        const [existe] = await db.query(`
            SELECT id FROM partidos
            WHERE temporada = ?
              AND equipo_local_id = ?
              AND equipo_visitante_id = ?
        `, [temporada, equipo_local_id, equipo_visitante_id]);

        if (existe.length > 0) {
            return res.status(409).json({ msg: 'Este enfrentamiento ya existe en la temporada seleccionada.' });
        }

        await db.query(`
            INSERT INTO partidos (equipo_local_id, equipo_visitante_id, temporada, fecha, horario, lugar, jugado)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `, [equipo_local_id, equipo_visitante_id, temporada, fecha, horario, lugar]);

        res.status(201).json({ msg: 'Partido creado exitosamente.' });
    } catch (err) {
        console.error('[crearPartido]', err);
        res.status(500).json({ error: 'Error al crear the partido.' });
    }
};

// edición de un partido existente, permitiendo modificar la fecha, horario y lugar del encuentro.
exports.editarPartido = async (req, res) => {
    const { id } = req.params;
    const { fecha, horario, lugar } = req.body;

    try {
        const [result] = await db.query(`
            UPDATE partidos
            SET fecha = ?, horario = ?, lugar = ?
            WHERE id = ?
        `, [fecha, horario, lugar, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Partido no encontrado.' });
        }

        res.json({ msg: 'Partido actualizado correctamente.' });
    } catch (err) {
        console.error('[editarPartido]', err);
        res.status(500).json({ error: 'Error al editar el partido.' });
    }
};

// actualiza el resultado de un partido y luego sincroniza la clasificación para reflejar los cambios en la tabla de clasificación.
exports.actualizarResultado = async (req, res) => {
    const { id, puntos_local, puntos_visitante, temporada } = req.body;

    if (!id || !temporada || puntos_local == null || puntos_visitante == null) {
        return res.status(400).json({ error: 'Faltan datos: id, puntos_local, puntos_visitante y temporada son requeridos.' });
    }

    if (puntos_local < 0 || puntos_visitante < 0) {
        return res.status(400).json({ error: 'Los puntos no pueden ser negativos.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            'UPDATE partidos SET puntos_local = ?, puntos_visitante = ?, jugado = 1 WHERE id = ?',
            [puntos_local, puntos_visitante, id]
        );

        await sincronizarClasificacion(conn, temporada);

        await conn.commit();
        res.json({ msg: 'Resultado y clasificación actualizados correctamente.' });
    } catch (err) {
        await conn.rollback();
        console.error('[actualizarResultado]', err);
        res.status(500).json({ error: 'Error al actualizar el resultado.' });
    } finally {
        conn.release();
    }
};

//se gestiona la eliminación de un partido, verificando si el partido estaba marcado como jugado para actualizar la clasificación en consecuencia.
exports.eliminarPartido = async (req, res) => {
    const { id } = req.params;
    const { temporada } = req.query;

    if (!temporada) {
        return res.status(400).json({ error: 'Se requiere el parámetro temporada.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[partido]] = await conn.query(
            'SELECT jugado FROM partidos WHERE id = ?', [id]
        );

        if (!partido) {
            await conn.rollback();
            return res.status(404).json({ error: 'Partido no encontrado.' });
        }

        await conn.query('DELETE FROM partidos WHERE id = ?', [id]);

        if (partido.jugado) {
            await sincronizarClasificacion(conn, temporada);
        }

        await conn.commit();
        res.json({ msg: 'Partido eliminado correctamente.' });
    } catch (err) {
        await conn.rollback();
        console.error('[eliminarPartido]', err);
        res.status(500).json({ error: 'Error al eliminar el partido.' });
    } finally {
        conn.release();
    }
};
// la función para reiniciar la temporada, que borra los resultados de los partidos y resetea la clasificación para una temporada dada.
exports.reiniciarLiga = async (req, res) => {
    const { temporada } = req.body;

    if (!temporada) {
        return res.status(400).json({ error: 'Se requiere el campo temporada.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query("SET SQL_SAFE_UPDATES = 0;");
        await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

        await conn.query(
            'UPDATE partidos SET puntos_local = 0, puntos_visitante = 0, jugado = 0 WHERE temporada = ?',
            [temporada]
        );

        await conn.query('DELETE FROM clasificacion WHERE temporada = ?', [temporada]);

        const [equipos] = await conn.query(
            `SELECT DISTINCT equipo_id FROM clasificacion WHERE temporada != ? 
             UNION 
             SELECT id FROM equipos`,
            [temporada]
        );

        // Obtener solo los equipos que pertenecen a esta temporada
        const [equiposTemporada] = await conn.query(`
            SELECT DISTINCT e.id 
            FROM equipos e
            JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id)
            WHERE p.temporada = ?
        `, [temporada]);

        if (equiposTemporada && equiposTemporada.length > 0) {
            const valores = equiposTemporada.map(e => [e.id, 0, 0, 0, 0, 0, 0, 0, temporada]);
            await conn.query(
                `INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada) VALUES ?`,
                [valores]
            );
        }

        await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
        await conn.query("SET SQL_SAFE_UPDATES = 1;");

        await conn.commit();
        res.json({ msg: 'Temporada reiniciada correctamente.' });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('[reiniciarLiga]', err);
        res.status(500).json({ error: 'Error al reiniciar la temporada.', detalle: err.message });
    } finally {
        if (conn) conn.release();
    }
};

// la función para iniciar la siguiente temporada (copiando equipos con estadísticas a cero)
exports.iniciarSiguienteTemporada = async (req, res) => {
    const { temporada, siguienteTemporada } = req.body;

    if (!temporada || !siguienteTemporada) {
        return res.status(400).json({ error: 'Se requieren temporada actual y temporada siguiente.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Obtener los equipos que participan en la temporada actual (desde la tabla clasificacion)
        const [equiposActuales] = await conn.query(
            'SELECT equipo_id FROM clasificacion WHERE temporada = ?',
            [temporada]
        );

        // 2. Si hay equipos en la temporada actual, registrarlos en la clasificación de la siguiente temporada (con 0 puntos, etc.)
        if (equiposActuales && equiposActuales.length > 0) {
            // Verificar primero si ya existen en la temporada siguiente para evitar duplicados
            const [equiposExistentesSiguiente] = await conn.query(
                'SELECT equipo_id FROM clasificacion WHERE temporada = ?',
                [siguienteTemporada]
            );
            const existentesSet = new Set(equiposExistentesSiguiente.map(e => e.equipo_id));

            const equiposAInsertar = equiposActuales.filter(e => !existentesSet.has(e.equipo_id));

            if (equiposAInsertar.length > 0) {
                const valores = equiposAInsertar.map(e => [e.equipo_id, 0, 0, 0, 0, 0, 0, 0, siguienteTemporada]);
                await conn.query(
                    `INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada) VALUES ?`,
                    [valores]
                );
            }
        }

        await conn.commit();
        res.json({ msg: 'Siguiente temporada iniciada correctamente.', siguienteTemporada });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('[iniciarSiguienteTemporada]', err);
        res.status(500).json({ error: 'Error al iniciar la siguiente temporada.', detalle: err.message });
    } finally {
        if (conn) conn.release();
    }
};