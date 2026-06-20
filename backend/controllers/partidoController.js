const db = require('../config/db');
const { eliminarEquipoHuerfano } = require('../helpers/equipoHelper');

// Sincronizar clasificación (función interna)
const sincronizarClasificacion = async (conn, temporada, categoria) => {
    await conn.query(`
        WITH stats AS (
            SELECT 
                equipo_id,
                COUNT(*) as pj,
                SUM(CASE WHEN es_local THEN (CASE WHEN puntos_local > puntos_visitante THEN 1 ELSE 0 END) ELSE (CASE WHEN puntos_visitante > puntos_local THEN 1 ELSE 0 END) END) as pg,
                SUM(CASE WHEN puntos_local = puntos_visitante THEN 1 ELSE 0 END) as pe,
                SUM(CASE WHEN es_local THEN (CASE WHEN puntos_local < puntos_visitante THEN 1 ELSE 0 END) ELSE (CASE WHEN puntos_visitante < puntos_local THEN 1 ELSE 0 END) END) as pp,
                SUM(CASE WHEN es_local THEN puntos_local ELSE puntos_visitante END) as tf,
                SUM(CASE WHEN es_local THEN puntos_visitante ELSE puntos_local END) as tc
            FROM (
                SELECT equipo_local_id AS equipo_id, true AS es_local, puntos_local, puntos_visitante 
                FROM partidos WHERE jugado = true AND temporada = $1 AND categoria = $2
                UNION ALL
                SELECT equipo_visitante_id AS equipo_id, false AS es_local, puntos_local, puntos_visitante 
                FROM partidos WHERE jugado = true AND temporada = $1 AND categoria = $2
            ) AS p
            GROUP BY equipo_id
        )
        UPDATE clasificacion c
        SET 
            pj = COALESCE(s.pj, 0),
            pg = COALESCE(s.pg, 0),
            pe = COALESCE(s.pe, 0),
            pp = COALESCE(s.pp, 0),
            tf = COALESCE(s.tf, 0),
            tc = COALESCE(s.tc, 0),
            puntos = (COALESCE(s.pg, 0) * 3) + COALESCE(s.pe, 0)
        FROM (
            SELECT c_inner.id, s_inner.pj, s_inner.pg, s_inner.pe, s_inner.pp, s_inner.tf, s_inner.tc
            FROM clasificacion c_inner 
            LEFT JOIN stats s_inner ON c_inner.equipo_id = s_inner.equipo_id 
            WHERE c_inner.temporada = $1 AND c_inner.categoria = $2
        ) s
        WHERE c.id = s.id;
    `, [temporada, categoria]);
};

// Obtener partidos de una temporada
exports.obtenerPartidos = async (req, res) => {
    const { temporada = '2026-1', categoria = 'Profesional' } = req.query;
    try {
        const { rows } = await db.query(`
            SELECT 
                p.id, p.jugado, p.puntos_local, p.puntos_visitante,
                p.temporada, p.fecha, p.horario, p.lugar, p.categoria,
                p.equipo_local_id, p.equipo_visitante_id,
                e1.nombre AS nombre_local,  e1.logo AS logo_local,
                e2.nombre AS nombre_visitante, e2.logo AS logo_visitante
            FROM partidos p
            JOIN equipos e1 ON p.equipo_local_id    = e1.id
            JOIN equipos e2 ON p.equipo_visitante_id = e2.id
            WHERE p.temporada = $1 AND p.categoria = $2
            ORDER BY p.fecha ASC, p.horario ASC
        `, [temporada, categoria]);
        res.json(rows);
    } catch (err) {
        console.error('[obtenerPartidos]', err);
        res.status(500).json({ error: 'Error al obtener los partidos.' });
    }
};

// Crear partido
exports.crearPartido = async (req, res) => {
    const { equipo_local_id, equipo_visitante_id, temporada, categoria = 'Profesional', fecha = null, horario = null, lugar = null } = req.body;

    if (Number(equipo_local_id) === Number(equipo_visitante_id)) {
        return res.status(400).json({ msg: 'Un equipo no puede ser local y visitante al mismo tiempo.' });
    }
    if (!equipo_local_id || !equipo_visitante_id || !temporada) {
        return res.status(400).json({ msg: 'equipo_local_id, equipo_visitante_id y temporada son obligatorios.' });
    }

    try {
        const { rows: existe } = await db.query(`
            SELECT id FROM partidos
            WHERE temporada = $1 AND equipo_local_id = $2 AND equipo_visitante_id = $3 AND categoria = $4
        `, [temporada, equipo_local_id, equipo_visitante_id, categoria]);

        if (existe.length > 0) {
            return res.status(409).json({ msg: 'Este enfrentamiento ya existe en la categoría y temporada seleccionadas.' });
        }

        await db.query(`
            INSERT INTO partidos (equipo_local_id, equipo_visitante_id, temporada, categoria, fecha, horario, lugar, jugado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, false)
        `, [equipo_local_id, equipo_visitante_id, temporada, categoria, fecha, horario, lugar]);

        res.status(201).json({ msg: 'Partido creado exitosamente.' });
    } catch (err) {
        console.error('[crearPartido]', err);
        res.status(500).json({ error: 'Error al crear el partido.' });
    }
};

// Editar partido
exports.editarPartido = async (req, res) => {
    const { id } = req.params;
    const { fecha, horario, lugar } = req.body;

    try {
        const { rowCount } = await db.query(`
            UPDATE partidos SET fecha = $1, horario = $2, lugar = $3 WHERE id = $4
        `, [fecha, horario, lugar, id]);

        if (rowCount === 0) {
            return res.status(404).json({ msg: 'Partido no encontrado.' });
        }
        res.json({ msg: 'Partido actualizado correctamente.' });
    } catch (err) {
        console.error('[editarPartido]', err);
        res.status(500).json({ error: 'Error al editar el partido.' });
    }
};

// Actualizar resultado
exports.actualizarResultado = async (req, res) => {
    const { id, puntos_local, puntos_visitante, temporada, categoria = 'Profesional' } = req.body;

    if (!id || !temporada || puntos_local == null || puntos_visitante == null) {
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }
    if (puntos_local < 0 || puntos_visitante < 0) {
        return res.status(400).json({ error: 'Los puntos no pueden ser negativos.' });
    }

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        await conn.query(
            'UPDATE partidos SET puntos_local = $1, puntos_visitante = $2, jugado = true WHERE id = $3',
            [puntos_local, puntos_visitante, id]
        );

        await sincronizarClasificacion(conn, temporada, categoria);

        await conn.query('COMMIT');
        res.json({ msg: 'Resultado y clasificación actualizados correctamente.' });
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('[actualizarResultado]', err);
        res.status(500).json({ error: 'Error al actualizar el resultado.' });
    } finally {
        conn.release();
    }
};

// Eliminar partido
exports.eliminarPartido = async (req, res) => {
    const { id } = req.params;
    const { temporada, categoria = 'Profesional' } = req.query;

    if (!temporada) {
        return res.status(400).json({ error: 'Se requiere el parámetro temporada.' });
    }

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        const { rows } = await conn.query(
            'SELECT jugado FROM partidos WHERE id = $1', [id]
        );
        const partido = rows[0];

        if (!partido) {
            await conn.query('ROLLBACK');
            return res.status(404).json({ error: 'Partido no encontrado.' });
        }

        await conn.query('DELETE FROM partidos WHERE id = $1', [id]);

        if (partido.jugado) {
            await sincronizarClasificacion(conn, temporada, categoria);
        }

        await conn.query('COMMIT');
        res.json({ msg: 'Partido eliminado correctamente.' });
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('[eliminarPartido]', err);
        res.status(500).json({ error: 'Error al eliminar el partido.' });
    } finally {
        conn.release();
    }
};

// Reiniciar liga
exports.reiniciarLiga = async (req, res) => {
    const { temporada, categoria = 'Profesional' } = req.body;

    if (!temporada) {
        return res.status(400).json({ error: 'Se requiere el campo temporada.' });
    }

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        await conn.query(
            'UPDATE partidos SET puntos_local = 0, puntos_visitante = 0, jugado = false WHERE temporada = $1 AND categoria = $2',
            [temporada, categoria]
        );

        await conn.query('DELETE FROM clasificacion WHERE temporada = $1 AND categoria = $2', [temporada, categoria]);

        const { rows: equiposTemporada } = await conn.query(`
            SELECT DISTINCT e.id 
            FROM equipos e
            JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id)
            WHERE p.temporada = $1 AND p.categoria = $2
        `, [temporada, categoria]);

        if (equiposTemporada.length > 0) {
            const valores = equiposTemporada.map((e, i) => {
                const base = i * 3;
                return `($${base+1}, 0, 0, 0, 0, 0, 0, 0, $${base+2}, $${base+3})`;
            }).join(', ');

            const params = equiposTemporada.flatMap(e => [e.id, temporada, categoria]);

            await conn.query(
                `INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria) VALUES ${valores}`,
                params
            );
        }

        await conn.query('COMMIT');
        res.json({ msg: 'Temporada reiniciada correctamente.' });
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('[reiniciarLiga]', err);
        res.status(500).json({ error: 'Error al reiniciar la temporada.' });
    } finally {
        conn.release();
    }
};

// Iniciar siguiente temporada
exports.iniciarSiguienteTemporada = async (req, res) => {
    const { temporada, siguienteTemporada } = req.body;

    if (!temporada || !siguienteTemporada) {
        return res.status(400).json({ error: 'Se requieren temporada actual y temporada siguiente.' });
    }

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        const { rows: equiposActuales } = await conn.query(
            'SELECT equipo_id, categoria FROM clasificacion WHERE temporada = $1', [temporada]
        );

        if (equiposActuales.length > 0) {
            const { rows: equiposExistentes } = await conn.query(
                'SELECT equipo_id, categoria FROM clasificacion WHERE temporada = $1', [siguienteTemporada]
            );
            const existentesSet = new Set(equiposExistentes.map(e => `${e.equipo_id}-${e.categoria}`));
            const equiposAInsertar = equiposActuales.filter(e => !existentesSet.has(`${e.equipo_id}-${e.categoria}`));

            if (equiposAInsertar.length > 0) {
                const valores = equiposAInsertar.map((e, i) => {
                    const base = i * 3;
                    return `($${base+1}, 0, 0, 0, 0, 0, 0, 0, $${base+2}, $${base+3})`;
                }).join(', ');

                const params = equiposAInsertar.flatMap(e => [e.equipo_id, siguienteTemporada, e.categoria]);

                await conn.query(
                    `INSERT INTO clasificacion (equipo_id, pj, pg, pe, pp, tf, tc, puntos, temporada, categoria) VALUES ${valores}`,
                    params
                );
            }
        }

        await conn.query('COMMIT');
        res.json({ msg: 'Siguiente temporada iniciada correctamente.', siguienteTemporada });
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('[iniciarSiguienteTemporada]', err);
        res.status(500).json({ error: 'Error al iniciar la siguiente temporada.' });
    } finally {
        conn.release();
    }
};
exports.eliminarTemporada = async (req, res) => {
    const { temporada } = req.query;
    if (!temporada) {
        return res.status(400).json({ error: 'Se requiere el parámetro temporada.' });
    }

    const conn = await db.connect();
    try {
        await conn.query('BEGIN');

        // Obtener los equipos registrados en esta temporada antes de borrarlos de clasificacion
        const { rows: equipos } = await conn.query(
            'SELECT equipo_id FROM clasificacion WHERE temporada = $1', [temporada]
        );

        // 1. Borrar partidos y clasificacion correspondientes a la temporada
        await conn.query('DELETE FROM partidos WHERE temporada = $1', [temporada]);
        await conn.query('DELETE FROM clasificacion WHERE temporada = $1', [temporada]);

        // 2. Borrar de forma física el equipo (y sus jugadores) ÚNICAMENTE si ya no existe 
        // registrado en ninguna otra temporada del sistema (evitando eliminar equipos compartidos).
        for (const { equipo_id } of equipos) {
            await eliminarEquipoHuerfano(conn, equipo_id);
        }

        await conn.query('COMMIT');
        res.json({ msg: `Temporada ${temporada} eliminada correctamente.` });
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('[eliminarTemporada]', err);
        res.status(500).json({ error: 'Error al eliminar la temporada.' });
    } finally {
        conn.release();
    }
};