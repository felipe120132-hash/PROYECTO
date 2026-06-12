import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

const IconCalendario = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconReloj = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

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
                  <IconCalendario />
                  {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Pendiente'}
                </div>
                <div className="detail-item">
                  <IconReloj />
                  {p.horario || 'Pendiente'}
                </div>
                <div className="detail-item">
                  <IconPin />
                  {p.lugar || 'Cancha por asignar'}
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