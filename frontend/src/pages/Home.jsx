import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Home.css';
import heroBg from '../assets/hero_bg.jpg';
import mvpImg from '../assets/mvp_player.png';

function Home() {
  const {
    temporada,
    equipos,
    verJugadores,
    searchTerm,
  } = useAppContext();

  const filteredEquipos = equipos.filter(eq =>
    eq.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="landing-grid anim-fade">
      {/* HERO */}
      <section className="hero-section">
        <img src={heroBg} alt="Basketball" className="hero-bg" />
        <div className="hero-content">
          <h1>LA SUPER LIGA</h1>
          <p>
            La plataforma definitiva para el desarrollo del talento. 
            Sigue a los equipos, consulta estadísticas en vivo y no te pierdas la acción de la temporada {temporada}.
          </p>
          <a href="/estadisticas" className="btn-primary" style={{ textDecoration: 'none' }}>
             Ver Clasificación
          </a>
        </div>
      </section>

      {/* MVP SECTION */}
      <section className="mvp-section">
        <div className="mvp-info">
          <span className="mvp-badge">MVP de la Semana</span>
          <h2>Carlos "El Rayo" Méndez</h2>
          <p className="mvp-desc">
            Promedió 28 puntos, 8 asistencias y 5 robos liderando a los Halcones hacia una racha de 3 victorias consecutivas.
          </p>
          <div className="mvp-stats">
            <div className="stat-box">
              <span className="stat-val">28</span>
              <span className="stat-label">PTS</span>
            </div>
            <div className="stat-box">
              <span className="stat-val">8</span>
              <span className="stat-label">AST</span>
            </div>
            <div className="stat-box">
              <span className="stat-val">5</span>
              <span className="stat-label">ROB</span>
            </div>
          </div>
        </div>
        <div className="mvp-image-container">
          <img src={mvpImg} alt="MVP Player" className="mvp-img" />
        </div>
      </section>

      {/* TEAMS SECTION */}
      <section className="teams-section">
        <div className="section-header">
          <span></span>
          <h2>Equipos Participantes</h2>
        </div>
        <div className="teams-grid">
          {filteredEquipos.length > 0 ? filteredEquipos.map((eq, i) => {
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
                <p className="team-division">División Juvenil</p>
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
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b' }}>
              No se encontraron equipos que coincidan con la búsqueda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
