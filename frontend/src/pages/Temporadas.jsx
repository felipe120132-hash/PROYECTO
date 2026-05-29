import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function Temporadas() {
  const {
    nuevaTemporadaInput, setNuevaTemporadaInput,
    crearTemporada,
  } = useAppContext();

  return (
    <div className="table-card anim-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="section-header">
        <span>📅</span>
        <h2>Administración de Temporadas</h2>
      </div>

      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          Crea una nueva temporada. Al hacerlo, se generará una liga en blanco para ese año.
        </p>
        <form onSubmit={crearTemporada} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="number"
            placeholder="Año de la temporada (ej. 2026)"
            value={nuevaTemporadaInput}
            onChange={e => setNuevaTemporadaInput(e.target.value)}
            className="season-select"
            style={{ flex: 1 }}
            required
            min="2000"
            max="2100"
          />
          <button type="submit" className="btn-primary">Crear Temporada</button>
        </form>
      </div>
    </div>
  );
}

export default Temporadas;
