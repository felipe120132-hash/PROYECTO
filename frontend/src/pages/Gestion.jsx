import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function Gestion() {
  const {
    temporada,
    nuevoEquipo, setNuevoEquipo,
    guardarEquipo,
    generarFixture,
  } = useAppContext();

  return (
    <div className="table-card anim-fade">
      <div className="section-header">
        <span>⚙️</span>
        <h2>Gestión de Torneo (Temp. {temporada})</h2>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Formulario de equipo */}
        <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '16px' }}>Agregar Equipo</h4>
          <form onSubmit={guardarEquipo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-group">
              <label>Nombre del Equipo</label>
              <input
                type="text" placeholder="Ej. Los Toros"
                value={nuevoEquipo} onChange={e => setNuevoEquipo(e.target.value)}
                className="season-select"
                required
              />
            </div>
            <button type="submit" className="btn-primary">➕ Registrar Equipo</button>
          </form>
        </div>

        {/* Acciones del torneo */}
        <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '16px' }}>Acciones del Torneo</h4>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Genera automáticamente todos los cruces de ida para los equipos actualmente registrados.
          </p>
          <button className="btn-success" onClick={generarFixture} style={{ width: '100%' }}>
            📅 Generar Fixture Automático
          </button>
        </div>
      </div>
    </div>
  );
}

export default Gestion;
