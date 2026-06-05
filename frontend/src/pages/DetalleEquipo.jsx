import React, { useEffect, useState } from 'react';
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
    subirFotoJugador,
    setEquipoSeleccionado,
    partidosDelEquipo,
    resultadoParaEquipo,
  } = useAppContext();

  const navigate = useNavigate();

  // 1 fila vacía para el alta de jugador
  const emptyRow = () => ({ nombre: '', categoria: '', puntos_anotados: '' });
  const [plantillaBatch, setPlantillaBatch] = useState(Array.from({ length: 1 }, emptyRow));
  const [guardandoBatch, setGuardandoBatch] = useState(false);

  const handleBatchChange = (index, field, value) => {
    setPlantillaBatch(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    const validos = plantillaBatch.filter(j => j.nombre.trim() && j.categoria.trim());
    if (validos.length === 0) return alert('Completa al menos un jugador con nombre y categoría.');
    setGuardandoBatch(true);
    const equipoIdVal = equipoSeleccionado.equipo_id ?? equipoSeleccionado.id;
    try {
      for (const j of validos) {
        await fetch(`https://proyecto-4t2l.onrender.com/api/jugadores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
          },
          body: JSON.stringify({
            nombre: j.nombre.trim(),
            categoria: j.categoria.trim(),
            puntos_anotados: parseInt(j.puntos_anotados) || 0,
            equipo_id: equipoIdVal,
          }),
        });
      }
      setPlantillaBatch(Array.from({ length: 1 }, emptyRow));
      verJugadores(equipoSeleccionado);
    } catch (err) {
      alert('Error al guardar la plantilla.');
    } finally {
      setGuardandoBatch(false);
    }
  };

  useEffect(() => {
    if (equipoId && equipos.length > 0) {
      const eqIdNum = Number(equipoId);
      // Validar si el equipo seleccionado actualmente existe en la lista de la nueva temporada
      const eqEnTemporada = equipos.find(e => Number(e.equipo_id ?? e.id) === eqIdNum);
      
      if (!eqEnTemporada) {
        // El equipo no existe en la temporada actual, limpiar selección y volver
        setEquipoSeleccionado(null);
        navigate('/equipos');
      } else {
        const currentSelId = equipoSeleccionado ? (equipoSeleccionado.equipo_id ?? equipoSeleccionado.id) : null;
        if (Number(currentSelId) !== eqIdNum) {
          verJugadores(eqEnTemporada);
        }
      }
    }
  }, [equipoId, equipos, equipoSeleccionado, verJugadores, setEquipoSeleccionado, navigate]);

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
                <div style={{ marginTop: '16px' }}>
                  <div className="upload-container">
                    <div className="upload-header">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: 600 }}>¡Sube un escudo para el equipo!</p>
                    </div>
                    <label htmlFor="file-upload" className="upload-footer">
                      <svg fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.331 6H8.5v20h15V14.154h-8.169z" />
                        <path d="M18.153 6h-.009v5.342H23.5v-.002z" />
                      </svg>
                      <p style={{ margin: 0, fontSize: '12px' }}>Seleccionar archivo</p>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          subirLogoArchivo(equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {token && (
        <div style={{ marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👥 Registrar Jugador
          </h4>
          <form onSubmit={handleBatchSubmit}>
            {/* Encabezado de columnas */}
            <div className="batch-player-header" style={{ display: 'grid', gridTemplateColumns: '28px 2fr 1fr 80px', gap: '8px', padding: '0 0 6px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
              <span />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>Nombre y Apellido</span>
              <span className="batch-category-col" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>Categoría</span>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', textAlign: 'center' }}>PTS</span>
            </div>
            {/* Filas de jugadores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {plantillaBatch.map((j, i) => (
                <div key={i} className="batch-player-row" style={{ display: 'grid', gridTemplateColumns: '28px 2fr 1fr 80px', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: j.nombre.trim() ? '#1e293b' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={j.nombre}
                    onChange={e => handleBatchChange(i, 'nombre', e.target.value)}
                    className="season-select"
                    style={{ minWidth: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={j.categoria}
                    onChange={e => handleBatchChange(i, 'categoria', e.target.value)}
                    className="season-select batch-category-col"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={j.puntos_anotados}
                    onChange={e => handleBatchChange(i, 'puntos_anotados', e.target.value)}
                    className="season-select"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="btn-success" style={{ width: '100%', padding: '12px' }} disabled={guardandoBatch}>
              {guardandoBatch ? '⏳ Guardando...' : '💾 Guardar Jugador'}
            </button>
          </form>
        </div>
      )}

      <h4 style={{ marginTop: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        👤 Plantilla del Equipo
      </h4>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Jugador</th><th>Categoría</th><th>PTS</th>
              {token && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {jugadores.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Sin jugadores registrados.</td></tr>
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
                      <td>
                        <div className="player-row-info">
                          <div className="player-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {j.foto ? (
                              <img src={j.foto} alt={j.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              j.nombre.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>{j.nombre}</span>
                        </div>
                      </td>
                      <td><span className="player-category">{j.categoria}</span></td>
                      <td><span className="player-points">{j.puntos_anotados ?? j.Puntos_anotados ?? 0} pts</span></td>
                      {token && (
                        <td>
                          <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                            <label htmlFor={`foto-upload-${j.id}`} className="btn-edit-inline" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              📷
                            </label>
                            <input
                              id={`foto-upload-${j.id}`}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  subirFotoJugador(j.id, e.target.files[0]);
                                }
                              }}
                            />
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

      <h4 style={{ marginTop: '28px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🏆 Partidos jugados
      </h4>
      {(() => {
        const jugados = partidosDelEquipo(eqId).filter(p => p.jugado);
        return jugados.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px', padding: '12px 0' }}>Sin partidos jugados.</p>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={res.cls}>{res.label}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                  {esLocal ? 'Como Local' : 'Como Visitante'}
                </span>
              </div>
            </div>
          );
        });
      })()}

      <h4 style={{ marginTop: '24px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📅 Partidos pendientes
      </h4>
      {(() => {
        const pendientes = partidosDelEquipo(eqId).filter(p => !p.jugado);
        return pendientes.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px', padding: '12px 0' }}>Sin partidos pendientes.</p>
        ) : pendientes.map(p => (
          <div key={p.id} className="partido-item">
            <div className="teams">
              <span>{p.nombre_local}</span>
              <span className="score" style={{ background: '#e2e8f0', color: '#334155', fontSize: '12px' }}>VS</span>
              <span>{p.nombre_visitante}</span>
            </div>
            <div className="estadio-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              <span>📅 {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Fecha pendiente'}</span>
              <span>🕐 {p.horario || 'Horario pendiente'}</span>
              <span>📍 {p.lugar || 'Lugar pendiente'}</span>
            </div>
          </div>
        ));
      })()}
    </div>
  );
}

export default DetalleEquipo;
