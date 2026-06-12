import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

function Estadisticas() {
  const {
    temporada,
    equipos,
    token,
    verJugadores,
    eliminarEquipo,
  } = useAppContext();

  const sorted = [...equipos].sort((a, b) => {
    if ((b.puntos ?? 0) !== (a.puntos ?? 0)) return (b.puntos ?? 0) - (a.puntos ?? 0);
    if ((b.dif ?? 0) !== (a.dif ?? 0)) return (b.dif ?? 0) - (a.dif ?? 0);
    return (b.tf ?? 0) - (a.tf ?? 0);
  });

  const totalPartidos = equipos.reduce((acc, eq) => acc + (eq.pj ?? 0), 0);
  const lider = sorted[0];

  return (
    <div className="table-card anim-fade">
      <div className="section-header-flex">
        <div>
          <h2>Tabla de Clasificación</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Sigue el rendimiento de los equipos en la liga actual.
          </p>
          <div className="season-badge">
            <IconCalendar /> Temporada {temporada}
          </div>
        </div>
      </div>

      {equipos.length > 0 && (
        <div className="stats-bar">
          <div className="stat-mini">
            <p className="label">Equipos</p>
            <p className="value">{equipos.length}</p>
          </div>
          <div className="stat-mini">
            <p className="label">Líder</p>
            <p className="value" style={{ fontSize: '15px' }}>{lider?.nombre ?? '—'}</p>
          </div>
          <div className="stat-mini">
            <p className="label">PTS líder</p>
            <p className="value">{lider?.puntos ?? 0}</p>
          </div>
          <div className="stat-mini">
            <p className="label">Partidos</p>
            <p className="value">{totalPartidos}</p>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="pos-cell">Pos</th>
              <th>Equipo</th>
              <th className="highlight-col">PTS</th>
              <th className="col-pj">PJ</th>
              <th className="col-pg">PG</th>
              <th className="col-pp">PP</th>
              <th className="col-tf">TF</th>
              <th className="col-tc">TC</th>
              <th style={{ textAlign: 'center' }}>DIF</th>
              <th style={{ textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((eq, i) => (
                <tr key={`${eq.clas_id ?? ''}-${eq.equipo_id ?? ''}-${eq.id ?? ''}-${i}`}>
                  <td className="pos-cell">
                    <span className={`medal ${i === 0 ? 'medal-1' : i === 1 ? 'medal-2' : i === 2 ? 'medal-3' : 'medal-n'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="team-cell">
                      <div className="team-icon-sm">
                        {eq.logo
                          ? <img src={eq.logo} alt={eq.nombre} />
                          : eq.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="team-name">{eq.nombre}</span>
                    </div>
                  </td>
                  <td className="highlight-col">
                    <span className="pts-pill">{eq.puntos ?? 0}</span>
                  </td>
                  <td className="col-pj" style={{ textAlign: 'center' }}>{eq.pj ?? 0}</td>
                  <td className="col-pg" style={{ textAlign: 'center' }}>{eq.pg ?? 0}</td>
                  <td className="col-pp" style={{ textAlign: 'center' }}>{eq.pp ?? 0}</td>
                  <td className="col-tf" style={{ textAlign: 'center' }}>{eq.tf ?? 0}</td>
                  <td className="col-tc" style={{ textAlign: 'center' }}>{eq.tc ?? 0}</td>
                  <td className={(eq.dif ?? 0) >= 0 ? 'positive-dif' : 'negative-dif'}>
                    {(eq.dif ?? 0) > 0 ? '+' : ''}{eq.dif ?? 0}
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      <button className="btn-edit-inline" onClick={() => verJugadores(eq)}>
                        <IconUsers /> Plantilla
                      </button>
                      {token && (
                        <button
                          className="btn-delete-inline"
                          onClick={() => eliminarEquipo(eq.equipo_id ?? eq.id)}
                          aria-label="Eliminar equipo"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No hay datos para la temporada {temporada}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-legend">
        <span>PTS: Puntos</span>
        <span>PJ: Partidos Jugados</span>
        <span>PG: Ganados</span>
        <span>PP: Perdidos</span>
        <span>TF/TC: Tantos Favor/Contra</span>
      </div>
    </div>
  );
}

export default Estadisticas;