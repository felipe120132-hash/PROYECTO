import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function CargarResultado() {
  const { partidoId } = useParams();
  const {
    partidos,
    resultadoData, setResultadoData,
    enviarResultado,
    fetchJugadoresEquipo,
    actualizarPuntosJugador,
  } = useAppContext();

  const navigate = useNavigate();
  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
  
  // Puntos individuales mapeados por jugador ID: { [jugadorId]: puntos }
  const [puntosJugadores, setPuntosJugadores] = useState({});

  const p = partidos.find(match => match.id === Number(partidoId));

  useEffect(() => {
    if (partidoId) {
      setResultadoData(prev => ({
        ...prev,
        partidoId: partidoId,
        puntos_local: '',
        puntos_visitante: ''
      }));
    }
  }, [partidoId, setResultadoData]);

  // Cargar jugadores de ambos equipos
  useEffect(() => {
    if (p) {
      let isCurrent = true;
      const loadPlayers = async () => {
        const localPlayers = await fetchJugadoresEquipo(p.equipo_local_id);
        const visitantePlayers = await fetchJugadoresEquipo(p.equipo_visitante_id);
        if (isCurrent) {
          setJugadoresLocal(localPlayers);
          setJugadoresVisitante(visitantePlayers);
          
          // Inicializar puntos de jugadores si ya tienen o dejarlos vacíos/0
          const initialPts = {};
          localPlayers.forEach(j => {
            initialPts[j.id] = j.puntos_anotados ?? j.Puntos_anotados ?? '';
          });
          visitantePlayers.forEach(j => {
            initialPts[j.id] = j.puntos_anotados ?? j.Puntos_anotados ?? '';
          });
          setPuntosJugadores(initialPts);
        }
      };
      loadPlayers();
      return () => {
        isCurrent = false;
      };
    }
  }, [p]);

  if (!p) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Partido no encontrado.</p>;
  }

  const handlePuntosChange = (jugadorId, val) => {
    setPuntosJugadores(prev => ({
      ...prev,
      [jugadorId]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Guardar el resultado global del partido
      await enviarResultado(e);

      // Guardar los puntos individuales de los jugadores editados/introducidos
      const promesas = [];
      Object.keys(puntosJugadores).forEach(jugadorId => {
        const pts = parseInt(puntosJugadores[jugadorId]);
        if (!isNaN(pts) && pts >= 0) {
          promesas.push(actualizarPuntosJugador(jugadorId, pts));
        }
      });

      if (promesas.length > 0) {
        await Promise.all(promesas);
      }
    } catch (error) {
      console.error('Error al guardar puntos de jugadores:', error);
    }
  };

  return (
    <div className="table-card anim-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn-cancel" onClick={() => navigate('/calendario')} style={{ marginBottom: '20px' }}>
        <span>←</span> Volver
      </button>

      <div className="section-header" style={{ justifyContent: 'center', marginBottom: '24px' }}>
        <span>✏️</span>
        <h2>Cargar Marcador y Puntos</h2>
      </div>

      {/* CABECERA DEL PARTIDO */}
      <div className="match-main" style={{ marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
        <div className="match-team team-local">
          <span>{p.nombre_local}</span>
          <div className="team-icon-sm">
             {p.logo_local ? <img src={p.logo_local} alt="local" /> : p.nombre_local.substring(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="match-vs-badge">VS</div>
        <div className="match-team team-visitante">
          <div className="team-icon-sm">
             {p.logo_visitante ? <img src={p.logo_visitante} alt="visita" /> : p.nombre_visitante.substring(0, 2).toUpperCase()}
          </div>
          <span>{p.nombre_visitante}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* MARCADOR GLOBAL */}
        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#1e293b' }}>
          🏀 Marcador Global del Partido
        </h3>
        <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div className="input-group">
            <label>Puntos {p.nombre_local} (Local)</label>
            <input
              type="number"
              value={resultadoData.puntos_local}
              onChange={e => setResultadoData({ ...resultadoData, puntos_local: e.target.value })}
              className="season-select"
              required
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Puntos {p.nombre_visitante} (Visitante)</label>
            <input
              type="number"
              value={resultadoData.puntos_visitante}
              onChange={e => setResultadoData({ ...resultadoData, puntos_visitante: e.target.value })}
              className="season-select"
              required
              min="0"
            />
          </div>
        </div>

        {/* PUNTOS INDIVIDUALES JUGADORES */}
        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#1e293b' }}>
          🏃 Puntos de los Jugadores
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px' }}>
          {/* JUGADORES LOCAL */}
          <div>
            <h4 style={{ color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              {p.nombre_local}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jugadoresLocal.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>Sin jugadores registrados en este equipo.</p>
              ) : (
                jugadoresLocal.map(j => (
                  <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="player-avatar" style={{ width: '28px', height: '28px', fontSize: '11px', background: '#3b82f6' }}>
                        {j.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{j.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        placeholder="PTS"
                        value={puntosJugadores[j.id] ?? ''}
                        onChange={e => handlePuntosChange(j.id, e.target.value)}
                        style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px' }}
                        min="0"
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* JUGADORES VISITANTE */}
          <div>
            <h4 style={{ color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
              {p.nombre_visitante}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jugadoresVisitante.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>Sin jugadores registrados en este equipo.</p>
              ) : (
                jugadoresVisitante.map(j => (
                  <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="player-avatar" style={{ width: '28px', height: '28px', fontSize: '11px', background: '#f97316' }}>
                        {j.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{j.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        placeholder="PTS"
                        value={puntosJugadores[j.id] ?? ''}
                        onChange={e => handlePuntosChange(j.id, e.target.value)}
                        style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '12px' }}
                        min="0"
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-success" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
          💾 Guardar Marcador e Historial de Puntos
        </button>
      </form>
    </div>
  );
}

export default CargarResultado;
