import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function DetalleEquipo() {
  const { equipoId } = useParams();
  const {
    token,
    temporada,
    equipoSeleccionado,
    equipos,
    jugadores,
    verJugadores,
    nuevoJugador, setNuevoJugador,
    editandoJugadorId, setEditandoJugadorId,
    datosEdicionJugador, setDatosEdicionJugador,
    guardarJugador,
    iniciarEdicionJugador,
    guardarCambiosJugador,
    eliminarJugador,
    guardarEntrenador,
    subirLogoArchivo,
    setEquipoSeleccionado,
    partidosDelEquipo,
    resultadoParaEquipo,
  } = useAppContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (equipoId && equipos.length > 0) {
      const eqIdNum = Number(equipoId);
      const currentSelId = equipoSeleccionado ? (equipoSeleccionado.equipo_id ?? equipoSeleccionado.id) : null;
      if (Number(currentSelId) !== eqIdNum) {
        const eq = equipos.find(e => Number(e.equipo_id ?? e.id) === eqIdNum);
        if (eq) {
          verJugadores(eq);
        }
      }
    }
  }, [equipoId, equipos, equipoSeleccionado, verJugadores]);

  if (!equipoSeleccionado) {
    if (equipoId && equipos.length === 0) {
      return (
        <div className="table-card anim-fade" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#64748b' }}>Cargando detalles del equipo...</p>
        </div>
      );
    }
    return (
      <div className="table-card anim-fade" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>No hay equipo seleccionado.</p>
        <button className="btn-primary" onClick={() => navigate('/equipos')}>
          Ir a Equipos
        </button>
      </div>
    );
  }

  const eqId = equipoSeleccionado.equipo_id ?? equipoSeleccionado.id;

  return (
    <div className="table-card anim-fade">
      <button className="btn-cancel" onClick={() => navigate('/equipos')} style={{ marginBottom: '20px' }}>
        <span>←</span> Volver a Equipos
      </button>

      <div className="section-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="team-logo-circle" style={{ marginBottom: 0, width: '100px', height: '100px', fontSize: '32px' }}>
             {equipoSeleccionado.logo ? (
               <img src={equipoSeleccionado.logo} alt={equipoSeleccionado.nombre} />
             ) : (
               equipoSeleccionado.nombre.substring(0, 2).toUpperCase()
             )}
          </div>
          <div>
            <h2> {equipoSeleccionado.nombre}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong>DT:</strong>
                {token ? (
                  <input
                    type="text"
                    className="season-select"
                    style={{ padding: '4px 12px', fontSize: '13px' }}
                    value={equipoSeleccionado.entrenador || ''}
                    onChange={(e) => setEquipoSeleccionado({ ...equipoSeleccionado, entrenador: e.target.value })}
                    onBlur={(e) => guardarEntrenador(equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, e.target.value)}
                  />
                ) : (
                  equipoSeleccionado.entrenador || 'Sin asignar'
                )}
              </p>
              {token && (
                <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <strong>Cambiar Escudo:</strong>
                  <input
                    type="file"
                    accept="image/*"
                    className="season-select"
                    style={{ padding: '4px 12px', fontSize: '13px', width: '220px' }}
                    onChange={(e) => subirLogoArchivo(equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, e.target.files[0])}
                  />
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {token && (
        <div style={{ marginBottom: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
          <h4>Añadir Jugador a la Plantilla</h4>
          <form onSubmit={guardarJugador} className="grid-form">
            <input
              type="text" placeholder="Nombre y Apellido"
              value={nuevoJugador.nombre}
              onChange={e => setNuevoJugador({ ...nuevoJugador, nombre: e.target.value })}
              className="season-select"
              required
            />
            <input
              type="text" placeholder="Categoría (ej. Sub-18)"
              value={nuevoJugador.categoria}
              onChange={e => setNuevoJugador({ ...nuevoJugador, categoria: e.target.value })}
              className="season-select"
              required
            />
            <input
              type="number" placeholder="Puntos"
              value={nuevoJugador.puntos_anotados}
              onChange={e => setNuevoJugador({ ...nuevoJugador, puntos_anotados: e.target.value })}
              className="season-select"
              required
            />
            <button type="submit" className="btn-success">Añadir</button>
          </form>
        </div>
      )}

      <h4>Plantilla del Equipo</h4>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Jugador</th><th>Categoría</th><th>Puntos Totales</th>
              {token && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {jugadores.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '12px' }}>Sin jugadores registrados.</td></tr>
            ) : (
              jugadores.map(j => (
                <tr key={j.id}>
                  {editandoJugadorId === j.id ? (
                    <>
                      <td><input className="edit-input" value={datosEdicionJugador.nombre} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, nombre: e.target.value })} /></td>
                      <td><input className="edit-input" value={datosEdicionJugador.categoria} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, categoria: e.target.value })} /></td>
                      <td><input className="edit-input" type="number" value={datosEdicionJugador.puntos_anotados} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, puntos_anotados: e.target.value })} /></td>
                      <td>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button className="btn-edit-inline" onClick={() => guardarCambiosJugador(j.id)}>💾</button>
                          <button className="btn-delete-inline" onClick={() => setEditandoJugadorId(null)}>✖</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{j.nombre}</td>
                      <td>{j.categoria}</td>
                      <td>{j.puntos_anotados ?? j.Puntos_anotados ?? 0}</td>
                      {token && (
                        <td>
                          <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-edit-inline" onClick={() => iniciarEdicionJugador(j)}>✏️</button>
                            <button className="btn-delete-inline" onClick={() => eliminarJugador(j.id)}>🗑️</button>
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h4 style={{ marginTop: '24px' }}>Partidos jugados</h4>
      {(() => {
        const jugados = partidosDelEquipo(eqId).filter(p => p.jugado);
        return jugados.length === 0 ? (
          <p style={{ color: '#888' }}>Sin partidos jugados.</p>
        ) : jugados.map(p => {
          const res = resultadoParaEquipo(p, eqId);
          const esLocal = Number(p.equipo_local_id) === Number(eqId);
          return (
            <div key={p.id} className="partido-item">
              <div className="teams">
                <span>{p.nombre_local}</span>
                <span className="score">{p.puntos_local} — {p.puntos_visitante}</span>
                <span>{p.nombre_visitante}</span>
              </div>
              <span className={res.cls}>{res.label} ({esLocal ? 'Local' : 'Visitante'})</span>
            </div>
          );
        });
      })()}

      <h4 style={{ marginTop: '16px' }}>Partidos pendientes</h4>
      {(() => {
        const pendientes = partidosDelEquipo(eqId).filter(p => !p.jugado);
        return pendientes.length === 0 ? (
          <p style={{ color: '#888' }}>Sin partidos pendientes.</p>
        ) : pendientes.map(p => (
          <div key={p.id} className="partido-item">
            <div className="teams">
              <span>{p.nombre_local}</span>
              <span className="score"> vs </span>
              <span>{p.nombre_visitante}</span>
            </div>
            <div className="estadio-info">
              📅 {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Fecha pendiente'}
              &nbsp;·&nbsp;🕐 {p.horario || 'Horario pendiente'}
              &nbsp;·&nbsp;📍 {p.lugar || 'Lugar pendiente'}
            </div>
          </div>
        ));
      })()}
    </div>
  );
}

export default DetalleEquipo;
