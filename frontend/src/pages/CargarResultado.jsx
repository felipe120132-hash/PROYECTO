import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function CargarResultado() {
  const { partidoId } = useParams();
  const {
    partidos,
    resultadoData, setResultadoData,
    enviarResultado,
  } = useAppContext();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (partidoId) {
      setResultadoData(prev => ({
        ...prev,
        partidoId: partidoId,
        puntos_local: '',
        puntos_visitante: ''
      }));
    }
  }, [partidoId, setResultadoData]);

  const p = partidos.find(p => p.id === Number(partidoId));

  if (!p) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Partido no encontrado.</p>;
  }

  const handleSubmit = (e) => {
    enviarResultado(e);
  };

  return (
    <div className="table-card anim-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button className="btn-cancel" onClick={() => navigate('/calendario')} style={{ marginBottom: '20px' }}>
        <span>←</span> Volver
      </button>

      <div className="section-header" style={{ justifyContent: 'center' }}>
        <span>✏️</span>
        <h2>Cargar Resultado</h2>
      </div>

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

      <form onSubmit={handleSubmit} className="grid-form">
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
        <button type="submit" className="btn-success" style={{ gridColumn: '1 / -1' }}>💾 Guardar Marcador</button>
      </form>
    </div>
  );
}

export default CargarResultado;
