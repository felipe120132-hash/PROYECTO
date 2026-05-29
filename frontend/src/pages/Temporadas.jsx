import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function Temporadas() {
  const {
    temporada,
    temporadas,
    eliminarTemporada,
    formatearTemporada,
  } = useAppContext();

  return (
    <div className="table-card anim-fade">
      <div className="section-header">
        <span>📅</span>
        <h2>Administración de Temporadas</h2>
      </div>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Desde aquí podés eliminar temporadas completas. Se borran todos los partidos,
        la clasificación y los equipos asociados a esa temporada.
      </p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Temporada</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {temporadas.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No hay temporadas registradas.
                </td>
              </tr>
            ) : (
              temporadas.map(temp => (
                <tr key={temp}>
                  <td><strong>{formatearTemporada(temp)}</strong></td>
                  <td>
                    {temp === temporada
                      ? <span style={{ color: '#22c55e', fontWeight: 'bold' }}>● Activa</span>
                      : <span style={{ color: '#ff0808' }}>○ Inactiva</span>
                    }
                  </td>
                  <td>
                    <button
                      className="btn-delete-inline"
                      onClick={() => eliminarTemporada(temp)}
                      disabled={temporadas.length <= 1}
                      title={temporadas.length <= 1 ? 'No podés eliminar la única temporada existente' : `Eliminar ${formatearTemporada(temp)}`}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {temporadas.length <= 1 && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>
          ⚠️ No podés eliminar la única temporada existente.
        </p>
      )}
    </div>
  );
}

export default Temporadas;
