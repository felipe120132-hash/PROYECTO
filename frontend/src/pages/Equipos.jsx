import React from 'react';
import { useAppContext } from '../context/AppContext';

function Equipos() {
  const {
    temporada,
    equipos,
    verJugadores,
    searchTerm,
    categoriaGlobal,
  } = useAppContext();

  const filteredEquipos = equipos.filter(eq =>
    eq.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-card anim-fade">
      <section className="teams-section">
        <div className="section-header">
          <span></span>
          <h2>Equipos de la Temporada {temporada}</h2>
        </div>
        <div className="teams-grid">
          {filteredEquipos.length > 0 ? filteredEquipos.map((eq, i) => {
            // Find the position of the team in the original sorted equipos array
            const originalIndex = equipos.findIndex(original => (original.id ?? original.equipo_id) === (eq.id ?? eq.equipo_id));
            const posicion = originalIndex !== -1 ? originalIndex + 1 : i + 1;
            
            return (
              <div key={`${eq.clas_id ?? ''}-${eq.equipo_id ?? ''}-${eq.id ?? ''}-${i}`} className="team-card" onClick={() => verJugadores(eq)}>
                <div className="team-logo-circle">
                  {eq.logo ? (
                    <img src={eq.logo} alt={eq.nombre} />
                  ) : (
                    eq.nombre.substring(0, 2).toUpperCase()
                  )}
                </div>
                <h3>{eq.nombre}</h3>
                <p className="team-division">División {categoriaGlobal}</p>
                <div className="team-metrics">
                  <div className="metric">
                    <span className="metric-val">{eq.puntos ?? 0}</span>
                    <span className="metric-label">Puntos</span>
                  </div>
                  <div className="metric">
                    <span className="metric-val metric-pos">{posicion}º</span>
                    <span className="metric-label">Posición</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <p style={{ textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
              No se encontraron equipos que coincidan con la búsqueda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Equipos;
