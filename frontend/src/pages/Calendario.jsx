import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css'; // Mantenemos el mismo css de tablas que usaba el Dashboard

function Calendario() {
  const {
    partidos,
    token,
    editandoPartido, setEditandoPartido,
    guardarEdicionPartido,
    eliminarPartido,
    setResultadoData,
  } = useAppContext();

  const navigate = useNavigate();

  return (
    <div className="table-card anim-fade">
      <div className="section-header">
        <span></span>
        <h2>Calendario de Partidos</h2>
      </div>

      {editandoPartido && (
        <form
          onSubmit={guardarEdicionPartido}
          className="grid-form"
          style={{ marginBottom: '16px', background: '#f0f4ff', padding: '12px', borderRadius: '8px' }}
        >
          <h4 style={{ gridColumn: '1 / -1', margin: '0 0 8px' }}>
            Editar: {editandoPartido.nombre_local} vs {editandoPartido.nombre_visitante}
          </h4>
          <div className="input-group">
            <label>Fecha</label>
            <input type="date" value={editandoPartido.fecha || ''} onChange={e => setEditandoPartido({ ...editandoPartido, fecha: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Horario</label>
            <input type="time" value={editandoPartido.horario || ''} onChange={e => setEditandoPartido({ ...editandoPartido, horario: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Lugar</label>
            <input type="text" placeholder="Nombre de la cancha" value={editandoPartido.lugar || ''} onChange={e => setEditandoPartido({ ...editandoPartido, lugar: e.target.value })} />
          </div>
          <button type="submit" className="btn-success">💾 Guardar</button>
          <button type="button" className="btn-cancel" onClick={() => setEditandoPartido(null)}>Cancelar</button>
        </form>
      )}

      {partidos.length === 0 ? (
        <p style={{ textAlign: 'center', margin: '20px' }}>Sin partidos generados para esta temporada.</p>
      ) : (
        <div className="calendar-grid">
          {partidos.map(p => (
            <div key={p.id} className="partido-item anim-fade">
              <div className="match-main">
                <div className="match-team team-local">
                  <span>{p.nombre_local}</span>
                  <div className="team-icon-sm">
                     {p.logo_local ? <img src={p.logo_local} alt={p.nombre_local} /> : p.nombre_local.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                
                {p.jugado ? (
                  <div className="match-score-badge">
                    {p.puntos_local} — {p.puntos_visitante}
                  </div>
                ) : (
                  <div className="match-vs-badge">VS</div>
                )}

                <div className="match-team team-visitante">
                  <div className="team-icon-sm">
                     {p.logo_visitante ? <img src={p.logo_visitante} alt={p.nombre_visitante} /> : p.nombre_visitante.substring(0, 2).toUpperCase()}
                  </div>
                  <span>{p.nombre_visitante}</span>
                </div>
              </div>

              <div className="match-details">
                <div className="detail-item">
                  <span>📅</span> {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Pendiente'}
                </div>
                <div className="detail-item">
                  <span>🕐</span> {p.horario || 'Pendiente'}
                </div>
                <div className="detail-item">
                  <span>📍</span> {p.lugar || 'Cancha por asignar'}
                </div>
              </div>

              {token && (
                <div className="match-actions">
                  <button
                    className="btn-edit-inline"
                    onClick={() => setEditandoPartido({
                      id: p.id,
                      nombre_local: p.nombre_local,
                      nombre_visitante: p.nombre_visitante,
                      fecha: p.fecha ? p.fecha.split('T')[0] : '',
                      horario: p.horario || '',
                      lugar: p.lugar || '',
                    })}
                  >
                    📋 Datos
                  </button>
                  <button
                    className="btn-edit-inline"
                    onClick={() => {
                      setResultadoData({
                        partidoId: p.id,
                        puntos_local: p.puntos_local || 0,
                        puntos_visitante: p.puntos_visitante || 0,
                      });
                      navigate(`/cargar/${p.id}`);
                    }}
                  >
                    ✏️ Marcador
                  </button>
                  <button className="btn-delete-inline" onClick={() => eliminarPartido(p.id)}>
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Calendario;
