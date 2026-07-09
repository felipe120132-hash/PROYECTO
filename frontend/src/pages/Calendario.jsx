/**
 * P�gina de Calendario.
 * Muestra el fixture de partidos de una temporada y categor�a espec�ficas.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Pencil, X } from 'lucide-react';
import './Dashboard.css';

import { Calendar as IconCalendario, Clock as IconReloj, MapPin as IconPin, FileText as IconDatos, Goal as IconMarcador, Trash2 as IconEliminar } from 'lucide-react';

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

      {/* ── MODAL ── */}
      {editandoPartido && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setEditandoPartido(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '28px 32px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pencil size={16} /> {editandoPartido.nombre_local} vs {editandoPartido.nombre_visitante}
              </h3>
              <button
                onClick={() => setEditandoPartido(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#999', display: 'flex', alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <hr style={{ margin: 0, border: 'none', borderTop: '1px solid #eee' }} />

            {/* Campos */}
            <form onSubmit={guardarEdicionPartido} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                  <IconCalendario size={14} /> Fecha
                </label>
                <input
                  type="date"
                  value={editandoPartido.fecha || ''}
                  onChange={e => setEditandoPartido({ ...editandoPartido, fecha: e.target.value })}
                  style={{
                    padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px',
                    outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                  <IconReloj size={14} /> Horario
                </label>
                <input
                  type="time"
                  value={editandoPartido.horario || ''}
                  onChange={e => setEditandoPartido({ ...editandoPartido, horario: e.target.value })}
                  style={{
                    padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px',
                    outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                  <IconPin size={14} /> Lugar
                </label>
                <input
                  type="text"
                  placeholder="Nombre de la cancha"
                  value={editandoPartido.lugar || ''}
                  onChange={e => setEditandoPartido({ ...editandoPartido, lugar: e.target.value })}
                  style={{
                    padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px',
                    outline: 'none', width: '100%', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '11px', borderRadius: '8px',
                    background: '#f97316', color: '#fff',
                    border: 'none', fontWeight: '700',
                    fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoPartido(null)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '8px',
                    background: '#f1f1f1', color: '#555',
                    border: 'none', fontWeight: '600',
                    fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
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
                  <IconCalendario size={14} />
                  {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Pendiente'}
                </div>
                <div className="detail-item">
                  <IconReloj size={14} />
                  {p.horario || 'Pendiente'}
                </div>
                <div className="detail-item">
                  <IconPin size={14} />
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
                    <IconDatos size={14} /> Datos
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
                    <IconMarcador size={14} /> Marcador
                  </button>
                  <button className="btn-delete-inline" onClick={() => eliminarPartido(p.id)}>
                    <IconEliminar size={14} />
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