import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function Estadisticas() {
  const {
    temporada,
    equipos,
    token,
    verJugadores,
    eliminarEquipo,
  } = useAppContext();

  return (
    <div className="table-card anim-fade">
      <div className="section-header-flex">
        <div>
          <h2>Tabla de Clasificación</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Sigue el rendimiento de los equipos en la liga actual.</p>
        </div>
        <div className="table-controls">
          <button className="filter-btn">≡</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pos</th><th>Equipo</th><th className="highlight-col">PTS</th>
              <th>PJ</th><th>PG</th><th>PP</th>
              <th>TF</th><th>TC</th><th>DIF</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {equipos.length > 0 ? (
              [...equipos]
                .sort((a, b) => {
                  if ((b.puntos ?? 0) !== (a.puntos ?? 0)) return (b.puntos ?? 0) - (a.puntos ?? 0);
                  if ((b.dif ?? 0) !== (a.dif ?? 0)) return (b.dif ?? 0) - (a.dif ?? 0);
                  return (b.tf ?? 0) - (a.tf ?? 0);
                })
                .map((eq, i) => (
                  <tr key={`${eq.clas_id ?? ''}-${eq.equipo_id ?? ''}-${eq.id ?? ''}-${i}`}>
                    <td><strong>{i + 1}</strong></td>
                    <td className="team-cell">
                      <div className="team-icon-sm">
                        {eq.logo ? <img src={eq.logo} alt={eq.nombre} /> : eq.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      {eq.nombre}
                    </td>
                    <td className="score-cell highlight-col">{eq.puntos ?? 0}</td>
                    <td>{eq.pj ?? 0}</td>
                    <td>{eq.pg ?? 0}</td>
                    <td>{eq.pp ?? 0}</td>
                    <td>{eq.tf ?? 0}</td>
                    <td>{eq.tc ?? 0}</td>
                    <td className={(eq.dif ?? 0) >= 0 ? 'positive-dif' : 'negative-dif'}>
                      {(eq.dif ?? 0) > 0 ? '+' : ''}{eq.dif ?? 0}
                    </td>
                    <td>
                      <button className="btn-edit-inline" onClick={() => verJugadores(eq)}>👥 Plantilla</button>
                      {token && (
                        <button className="btn-delete-inline" onClick={() => eliminarEquipo(eq.equipo_id ?? eq.id)}>🗑️</button>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No hay datos para la temporada {temporada}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="table-legend">
        <span>● PTS: Puntos</span>
        <span>● PJ: Partidos Jugados</span>
        <span>● PG: Ganados</span>
        <span>● PP: Perdidos</span>
        <span>● TF/TC: Tantos Favor/Contra</span>
      </div>
    </div>
  );
}

export default Estadisticas;
