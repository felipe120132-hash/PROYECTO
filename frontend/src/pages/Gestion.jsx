import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Dashboard.css';

function Gestion() {
  const {
    temporada,
    temporadas,
    nuevoEquipo, setNuevoEquipo,
    crearEquipo,
    generarCalendarioAleatorio,
    reiniciarTodo,
    formatearTemporada,
  } = useAppContext();

  return (
    <div className="table-card anim-fade">
      <div className="section-header">
        <span>⚙️</span>
        <h2>Gestión de Torneo</h2>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Formulario de equipo */}
        <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '16px' }}>Agregar Equipo</h4>
          <form onSubmit={crearEquipo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-group">
              <label>Nombre del Equipo</label>
              <input
                type="text" placeholder="Ej. Los Toros"
                value={nuevoEquipo.nombre} onChange={e => setNuevoEquipo({ ...nuevoEquipo, nombre: e.target.value })}
                className="season-select"
                required
              />
            </div>
            <div className="input-group">
              <label>Temporada de Destino</label>
              <select
                value={nuevoEquipo.temporadaEquipo}
                onChange={e => setNuevoEquipo({ ...nuevoEquipo, temporadaEquipo: e.target.value })}
                className="season-select"
                style={{ width: '100%' }}
              >
                {temporadas.map(temp => (
                  <option key={temp} value={temp}>{formatearTemporada(temp)}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">➕ Registrar Equipo</button>
          </form>
        </div>

        {/* Acciones del torneo */}
        <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '16px' }}>Acciones del Torneo</h4>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Las siguientes acciones aplican a la temporada seleccionada: <strong>{formatearTemporada(temporada)}</strong>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-success" onClick={generarCalendarioAleatorio} style={{ width: '100%' }}>
              📅 Generar Fixture Todo vs Todo
            </button>
            <button className="btn-danger" onClick={reiniciarTodo} style={{ width: '100%' }}>
              ⚠️ Iniciar Siguiente Temporada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gestion;
