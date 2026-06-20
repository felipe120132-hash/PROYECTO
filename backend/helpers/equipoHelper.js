const eliminarEquipoHuerfano = async (conn, equipo_id) => {
    const { rows: conteo } = await conn.query(
        'SELECT COUNT(*) AS total FROM clasificacion WHERE equipo_id = $1',
        [equipo_id]
    );
    if (parseInt(conteo[0].total) === 0) {
        await conn.query('DELETE FROM jugadores WHERE equipo_id = $1', [equipo_id]);
        await conn.query('DELETE FROM equipos WHERE id = $1', [equipo_id]);
    }
};

module.exports = { eliminarEquipoHuerfano };
