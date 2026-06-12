import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { Trophy } from 'lucide-react';
import './Home.css';
import heroBg from '../assets/hero_bg.jpg';

const API = 'https://proyecto-4t2l.onrender.com/api';

function Home() {
  const {
    temporada,
    equipos,
    verJugadores,
    searchTerm,
  } = useAppContext();

  const [mvp, setMvp] = useState(null);

  // Fetch top scorer from all teams in the active season
  useEffect(() => {
    let cancelled = false;
    setMvp(null); // Limpiar el MVP anterior inmediatamente
    
    if (!equipos || equipos.length === 0) return;

    const fetchMvp = async () => {
      try {
        // Guardamos la temporada actual para la que estamos pidiendo los datos
        const temporadaDeLaPeticion = temporada;

        // Fetch players for all teams in parallel
        const requests = equipos.map(eq =>
          axios.get(`${API}/jugadores/equipo/${eq.equipo_id ?? eq.id}`)
            .then(r => r.data.map(j => ({ ...j, equipo_nombre: eq.nombre })))
            .catch(() => [])
        );
        const results = await Promise.all(requests);
        
        // Si la petición fue cancelada o si el usuario cambió de temporada en el selector 
        // mientras la consulta asíncrona estaba en vuelo, descartamos el resultado.
        if (cancelled || temporadaDeLaPeticion !== temporada) return;

        const todos = results.flat();
        if (todos.length === 0) return;

        // Find player with maximum points
        const top = todos.reduce((best, j) => {
          const pts = j.puntos_anotados ?? j.Puntos_anotados ?? 0;
          const bestPts = best.puntos_anotados ?? best.Puntos_anotados ?? 0;
          return pts > bestPts ? j : best;
        }, todos[0]);

        setMvp(top);
      } catch (err) {
        console.error('[fetchMvp]', err);
      }
    };

    fetchMvp();
    return () => { 
      cancelled = true; 
    };
  }, [equipos, temporada]);

  const filteredEquipos = equipos.filter(eq =>
    eq.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mvpPts = mvp ? (mvp.puntos_anotados ?? mvp.Puntos_anotados ?? 0) : 0;
  const mvpNombre = mvp?.nombre ?? '—';
  const mvpEquipo = mvp?.equipo_nombre ?? '';
  const mvpCategoria = mvp?.categoria ?? '';

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
          <span className="mvp-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Trophy size={18} /> MVP de la Temporada</span>
          {mvp ? (
            <>
              <h2>{mvpNombre}</h2>
              <p className="mvp-desc">
                El máximo anotador de la temporada con <strong>{mvpPts} puntos totales</strong>.
                {mvpEquipo && <> Jugador de <strong>{mvpEquipo}</strong>.</>}
                {mvpCategoria && <> Categoría: <strong>{mvpCategoria}</strong>.</>}
              </p>
              <div className="mvp-stats">
                <div className="stat-box">
                  <span className="stat-val">{mvpPts}</span>
                  <span className="stat-label">PTS Totales</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{mvpCategoria || '—'}</span>
                  <span className="stat-label">Categoría</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val" style={{ fontSize: '16px' }}>{mvpEquipo || '—'}</span>
                  <span className="stat-label">Equipo</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ color: '#94a3b8' }}>Sin datos aún</h2>
              <p className="mvp-desc">
                Carga resultados y puntos de los jugadores para ver al MVP de la temporada aquí.
              </p>
              <div className="mvp-stats">
                <div className="stat-box">
                  <span className="stat-val">—</span>
                  <span className="stat-label">PTS</span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mvp-image-container">
          <div className="mvp-avatar-large" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '50%' }}>
            {mvp?.foto ? (
              <img src={mvp.foto} alt={mvpNombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              mvpNombre !== '—' ? mvpNombre.charAt(0).toUpperCase() : '?'
            )}
          </div>
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
