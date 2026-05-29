import React from 'react';
import { useAppContext } from '../context/AppContext';

function Equipos() {
  const {
    temporada,
    equipos,
    verJugadores,
  } = useAppContext();

  return (
    <div className="table-card anim-fade">
      <section className="teams-section">
        <div className="section-header">
          <span></span>
          <h2>Equipos de la Temporada {temporada}</h2>
        </div>
        <div className="teams-grid">
          {equipos.length > 0 ? equipos.map((eq, i) => (
            <div key={`${eq.clas_id ?? ''}-${eq.equipo_id ?? ''}-${eq.id ?? ''}-${i}`} className="team-card" onClick={() => verJugadores(eq)}>
              <div className="team-logo-circle">
                {eq.logo ? (
                  <img src={eq.logo} alt={eq.nombre} />
                ) : (
                  eq.nombre.substring(0, 2).toUpperCase()
                )}
              </div>
              <h3>{eq.nombre}</h3>
              <p className="team-division">División Juvenil</p>
              <div className="team-metrics">
                <div className="metric">
                  <span className="metric-val">{eq.puntos ?? 0}</span>
                  <span className="metric-label">Puntos</span>
                </div>
                <div className="metric">
                  <span className="metric-val metric-pos">{i + 1}º</span>
                  <span className="metric-label">Posición</span>
                </div>
              </div>
            </div>
          )) : (
            <p style={{ textAlign: 'center', color: '#64748b' }}>
              Sin equipos registrados para esta temporada.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Equipos;
