import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:3000/api';

function App() {
  // ── NAVEGACIÓN ──────────────────────────────────────────────────────────────
  const [pestaña, setPestaña] = useState('landing');
  const [temporada, setTemporada] = useState('2026-2');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loginData, setLoginData] = useState({ usuario: '', password: '' });

  // ── DATOS PRINCIPALES ───────────────────────────────────────────────────────
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);

  // ── JUGADORES ────────────────────────────────────────────────────────────────
  const [jugadores, setJugadores] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [nuevoJugador, setNuevoJugador] = useState({ nombre: '', categoria: '', puntos_anotados: '' });
  const [editandoJugadorId, setEditandoJugadorId] = useState(null);
  const [datosEdicionJugador, setDatosEdicionJugador] = useState({ nombre: '', categoria: '', puntos_anotados: '' });

  // ── EQUIPOS ──────────────────────────────────────────────────────────────────
  const [nuevoEquipo, setNuevoEquipo] = useState({ nombre: '', temporadaEquipo: '2026-2' });
  const creandoEquipo = useRef(false);

  // ── PARTIDOS ─────────────────────────────────────────────────────────────────
  const [resultadoData, setResultadoData] = useState({ partidoId: '', puntos_local: '', puntos_visitante: '' });
  const [editandoPartido, setEditandoPartido] = useState(null);

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  const authHeader = () => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-auth-token': token
    }
  });

  // ── CARGA DE DATOS ───────────────────────────────────────────────────────────
  useEffect(() => {
    setEquipos([]);
    setPartidos([]);
    cargarEquipos(temporada);
    cargarPartidos(temporada);
  }, [temporada]);

  // ── SINCRONIZAR SELECTOR DE TEMPORADA Y RESETEAR GUARD ──────────────────────
  useEffect(() => {
    setNuevoEquipo(prev => ({ ...prev, temporadaEquipo: temporada }));
    creandoEquipo.current = false; // resetear guard al cambiar temporada
  }, [temporada]);

  const cargarEquipos = async (temp) => {
    const t = temp ?? temporada;
    try {
      const res = await axios.get(`${API}/clasificacion?temporada=${t}`);
      setEquipos(res.data);
    } catch (err) {
      console.error('[cargarEquipos]', err);
      setEquipos([]);
    }
  };

  const cargarPartidos = async (temp) => {
    const t = temp ?? temporada;
    try {
      const res = await axios.get(`${API}/partidos?temporada=${t}`);
      setPartidos(res.data);
    } catch (err) {
      console.error('[cargarPartidos]', err);
      setPartidos([]);
    }
  };

  // ── AUTENTICACIÓN ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, loginData);
      const nuevoToken = res.data.token;
      setToken(nuevoToken);
      localStorage.setItem('token', nuevoToken);
      setPestaña('clasificacion');
    } catch (err) {
      alert('Credenciales incorrectas o sesión no autorizada.');
      console.error(err);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setPestaña('clasificacion');
  };

  // ── GESTIÓN DE EQUIPOS ───────────────────────────────────────────────────────
  const crearEquipo = async (e) => {
    e.preventDefault();
    if (creandoEquipo.current) return;
    creandoEquipo.current = true;

    if (!nuevoEquipo.nombre.trim()) {
      creandoEquipo.current = false;
      return alert('El nombre del equipo es obligatorio.');
    }

    const temporadaDestino = nuevoEquipo.temporadaEquipo || temporada;

    try {
      await axios.post(
        `${API}/equipos`,
        { nombre: nuevoEquipo.nombre.trim(), temporada: temporadaDestino },
        authHeader()
      );
      alert(`✅ Equipo "${nuevoEquipo.nombre.trim()}" creado en la Temporada ${temporadaDestino}`);
      setNuevoEquipo({ nombre: '', temporadaEquipo: temporadaDestino });
      if (temporadaDestino === temporada) cargarEquipos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ ' + (err.response?.data?.msg || 'Error al crear equipo'));
    } finally {
      creandoEquipo.current = false;
    }
  };

  const eliminarEquipo = async (id) => {
    const tieneJugados = partidos.some(
      p => (Number(p.equipo_local_id) === Number(id) || Number(p.equipo_visitante_id) === Number(id)) && p.jugado === 1
    );
    if (tieneJugados) {
      alert('🚫 No se puede eliminar: el equipo tiene partidos jugados.');
      return;
    }
    if (!window.confirm('¿Eliminar equipo? Se borrarán sus jugadores y partidos pendientes.')) return;
    try {
      await axios.delete(`${API}/equipos/${id}?temporada=${temporada}`, authHeader());
      cargarEquipos(temporada);
      cargarPartidos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ ' + (err.response?.data?.msg || 'Error al eliminar equipo'));
    }
  };

  const guardarEntrenador = async (id, nuevoNombre) => {
    try {
      await axios.put(`${API}/equipos/${id}`, { entrenador: nuevoNombre }, authHeader());
      setEquipoSeleccionado(prev => ({ ...prev, entrenador: nuevoNombre }));
      cargarEquipos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('Error al actualizar el entrenador.');
    }
  };

  // ── GESTIÓN DE JUGADORES ─────────────────────────────────────────────────────
  const verJugadores = async (equipo) => {
    setEquipoSeleccionado(equipo);
    setEditandoJugadorId(null);
    try {
      const [resJugadores, resPartidos] = await Promise.all([
        axios.get(`${API}/jugadores/equipo/${equipo.equipo_id ?? equipo.id}`),
        axios.get(`${API}/partidos?temporada=${temporada}`)
      ]);
      setJugadores(resJugadores.data);
      setPartidos(resPartidos.data);
      setPestaña('jugadores');
    } catch {
      alert('Error al cargar la plantilla.');
    }
  };

  const guardarJugador = async (e) => {
    e.preventDefault();
    if (!nuevoJugador.nombre.trim() || !nuevoJugador.categoria.trim()) {
      return alert('Nombre y categoría son obligatorios.');
    }
    try {
      await axios.post(
        `${API}/jugadores`,
        { ...nuevoJugador, equipo_id: equipoSeleccionado.equipo_id ?? equipoSeleccionado.id },
        authHeader()
      );
      setNuevoJugador({ nombre: '', categoria: '', puntos_anotados: '' });
      verJugadores(equipoSeleccionado);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('Error al guardar jugador.');
    }
  };

  const iniciarEdicionJugador = (j) => {
    setEditandoJugadorId(j.id);
    setDatosEdicionJugador({
      nombre: j.nombre,
      categoria: j.categoria,
      puntos_anotados: j.puntos_anotados ?? j.Puntos_anotados ?? 0,
    });
  };

  const guardarCambiosJugador = async (id) => {
    try {
      await axios.put(`${API}/jugadores/${id}`, datosEdicionJugador, authHeader());
      setEditandoJugadorId(null);
      verJugadores(equipoSeleccionado);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('Error al actualizar jugador.');
    }
  };

  const eliminarJugador = async (id) => {
    if (!window.confirm('¿Eliminar jugador?')) return;
    try {
      await axios.delete(`${API}/jugadores/${id}`, authHeader());
      verJugadores(equipoSeleccionado);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('Error al eliminar jugador.');
    }
  };

  // ── GESTIÓN DE PARTIDOS ──────────────────────────────────────────────────────
  const enviarResultado = async (e) => {
    e.preventDefault();
    const pl = parseInt(resultadoData.puntos_local);
    const pv = parseInt(resultadoData.puntos_visitante);
    if (isNaN(pl) || isNaN(pv) || pl < 0 || pv < 0) {
      return alert('Los puntos deben ser números no negativos.');
    }
    try {
      await axios.put(
        `${API}/partidos/resultado`,
        { id: resultadoData.partidoId, puntos_local: pl, puntos_visitante: pv, temporada },
        authHeader()
      );
      alert('✅ Marcador guardado y clasificación actualizada.');
      setResultadoData({ partidoId: '', puntos_local: '', puntos_visitante: '' });
      await cargarEquipos(temporada);
      await cargarPartidos(temporada);
      setPestaña('clasificacion');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al guardar el resultado:\n' + (err.response?.data?.error || err.message));
    }
  };

  const guardarEdicionPartido = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API}/partidos/${editandoPartido.id}`,
        {
          fecha: editandoPartido.fecha || null,
          horario: editandoPartido.horario || null,
          lugar: editandoPartido.lugar || null,
        },
        authHeader()
      );
      setEditandoPartido(null);
      cargarPartidos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al editar partido:\n' + (err.response?.data?.error || err.message));
    }
  };

  const eliminarPartido = async (id) => {
    if (!window.confirm('¿Eliminar este partido?')) return;
    try {
      await axios.delete(`${API}/partidos/${id}?temporada=${temporada}`, authHeader());
      cargarPartidos(temporada);
      cargarEquipos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al eliminar partido:\n' + (err.response?.data?.error || err.message));
    }
  };

  const generarCalendarioAleatorio = async () => {
    if (equipos.length < 2) return alert('Necesitás al menos 2 equipos.');
    if (!window.confirm(`¿Generar calendario Todo vs Todo (ida y vuelta) para la Temporada ${temporada}?`)) return;

    const cruces = [];
    for (let i = 0; i < equipos.length; i++) {
      for (let j = 0; j < equipos.length; j++) {
        if (i === j) continue;
        cruces.push({
          equipo_local_id: equipos[i].equipo_id ?? equipos[i].id,
          equipo_visitante_id: equipos[j].equipo_id ?? equipos[j].id,
          temporada,
        });
      }
    }

    const shuffled = cruces.sort(() => Math.random() - 0.5);
    const errores = [];

    for (const partido of shuffled) {
      try {
        await axios.post(`${API}/partidos`, partido, authHeader());
      } catch (err) {
        if (err.response?.status === 401) { handleLogout(); return; }
        if (err.response?.status !== 409) {
          errores.push(err.response?.data?.msg || err.message);
        }
      }
    }

    if (errores.length > 0) {
      alert(`⚠️ Calendario generado con ${errores.length} error(es):\n${errores.slice(0, 3).join('\n')}`);
    } else {
      alert('📅 Calendario ida y vuelta generado correctamente.');
    }

    cargarPartidos(temporada);
    setPestaña('partidos');
  };

  const reiniciarTodo = async () => {
    if (!window.confirm(`¿REINICIAR la temporada ${temporada}? Se borrarán todos los resultados y el calendario.`)) return;
    try {
      await axios.post(`${API}/partidos/reiniciar`, { temporada }, authHeader());
      await cargarEquipos(temporada);
      await cargarPartidos(temporada);
      setPestaña('clasificacion');
      alert('✅ Temporada reiniciada.');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al reiniciar:\n' + (err.response?.data?.error || err.message));
    }
  };

  // ── HELPERS DE VISTA POR EQUIPO ──────────────────────────────────────────────
  const partidosDelEquipo = (equipoId) => {
    const id = Number(equipoId);
    return partidos.filter(p => Number(p.equipo_local_id) === id || Number(p.equipo_visitante_id) === id);
  };

  const resultadoParaEquipo = (p, equipoId) => {
    const id = Number(equipoId);
    const esLocal = Number(p.equipo_local_id) === id;
    const pf = esLocal ? p.puntos_local : p.puntos_visitante;
    const pc = esLocal ? p.puntos_visitante : p.puntos_local;
    if (pf > pc) return { label: 'Victoria', cls: 'resultado-victoria' };
    if (pf < pc) return { label: 'Derrota', cls: 'resultado-derrota' };
    return { label: 'Empate', cls: 'resultado-empate' };
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="container">

      {/* HEADER */}
      <header className="main-header">
        <div className="header-flex">
          <h1>🏀 Basketball League</h1>
          <div className="season-selector">
            <label>Temporada: </label>
            <select value={temporada} onChange={(e) => setTemporada(e.target.value)}>
              <option value="2025-2">2025-II</option>
              <option value="2026-2">2026-II</option>
            </select>
          </div>
        </div>
        {token && <span className="admin-status">⚙️ Modo Admin Activo</span>}
      </header>

      {/* NAVEGACIÓN */}
      <nav className="nav-menu">
        <button className={pestaña === 'landing' ? 'active' : ''} onClick={() => setPestaña('landing')}>
          🏠 Inicio
        </button>
        <button className={pestaña === 'clasificacion' ? 'active' : ''} onClick={() => setPestaña('clasificacion')}>
          📊 Tabla
        </button>
        <button className={pestaña === 'partidos' ? 'active' : ''} onClick={() => setPestaña('partidos')}>
          🗓️ Partidos
        </button>
        {token && (
          <button className={pestaña === 'gestion' ? 'active' : ''} onClick={() => setPestaña('gestion')}>
            ⚙️ Gestión
          </button>
        )}
        {token ? (
          <button className="btn-logout-nav" onClick={handleLogout}>Cerrar Sesión</button>
        ) : (
          <button className={pestaña === 'login' ? 'active' : ''} onClick={() => setPestaña('login')}>
            🔐 Admin
          </button>
        )}
      </nav>

      <main className="content">

        {/* ── LANDING PAGE ── */}
        {pestaña === 'landing' && (
          <div className="card anim-fade landing-card">
            <div className="landing-hero">
              <span className="landing-icon">🏀</span>
              <h2>Liga de Baloncesto Juvenil</h2>
              <p className="landing-season">Temporada {temporada}</p>
              <p className="landing-desc">
                Sigue en tiempo real la clasificación, el calendario de partidos y el detalle de cada equipo de la liga.
              </p>
            </div>
            <div className="landing-actions">
              <button className="btn-landing" onClick={() => setPestaña('clasificacion')}>
                📊 Ver Clasificación
              </button>
              <button className="btn-landing" onClick={() => setPestaña('partidos')}>
                🗓️ Ver Calendario
              </button>
            </div>
            <div className="landing-equipos">
              <h3>Equipos participantes</h3>
              <div className="equipos-grid">
                {equipos.length > 0 ? equipos.map((eq, i) => (
                  <div key={eq.clas_id ?? eq.equipo_id ?? eq.id} className="equipo-card" onClick={() => verJugadores(eq)}>
                    <span className="equipo-pos">#{i + 1}</span>
                    <span className="equipo-nombre">{eq.nombre}</span>
                    <span className="equipo-pts">{eq.puntos ?? 0} pts</span>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: '#888' }}>Sin equipos registrados para esta temporada.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TABLA DE CLASIFICACIÓN ── */}
        {pestaña === 'clasificacion' && (
          <div className="card anim-fade">
            <h3>Clasificación Actual — {temporada}</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Pos</th><th>Equipo</th><th>Pts</th>
                    <th>PJ</th><th>PG</th><th>PE</th><th>PP</th>
                    <th>TF</th><th>TC</th><th>DIF</th><th>Acciones</th>
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
                        <tr key={eq.clas_id ?? eq.equipo_id ?? eq.id}>
                          <td><strong>{i + 1}</strong></td>
                          <td className="bold">{eq.nombre}</td>
                          <td className="score-cell">{eq.puntos ?? 0}</td>
                          <td>{eq.pj ?? 0}</td>
                          <td>{eq.pg ?? 0}</td>
                          <td>{eq.pe ?? 0}</td>
                          <td>{eq.pp ?? 0}</td>
                          <td>{eq.tf ?? 0}</td>
                          <td>{eq.tc ?? 0}</td>
                          <td className={(eq.dif ?? 0) >= 0 ? 'positive-dif' : 'negative-dif'}>
                            {(eq.dif ?? 0) > 0 ? '+' : ''}{eq.dif ?? 0}
                          </td>
                          <td>
                            <button className="btn-edit-inline" onClick={() => verJugadores(eq)}>👥 Ver</button>
                            {token && (
                              <button className="btn-delete-inline" onClick={() => eliminarEquipo(eq.equipo_id ?? eq.id)}>🗑️</button>
                            )}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                        No hay datos para la temporada {temporada}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VISTA POR EQUIPO ── */}
        {pestaña === 'jugadores' && equipoSeleccionado && (
          <div className="card anim-fade">
            <button className="btn-cancel" onClick={() => setPestaña('clasificacion')}>← Volver a Clasificación</button>

            <div style={{ margin: '20px 0' }}>
              <h3>🏀 {equipoSeleccionado.nombre}</h3>
              <p>
                <strong>DT: </strong>
                {token ? (
                  <input
                    type="text"
                    className="edit-input-small"
                    value={equipoSeleccionado.entrenador || ''}
                    onChange={(e) => setEquipoSeleccionado({ ...equipoSeleccionado, entrenador: e.target.value })}
                    onBlur={(e) => guardarEntrenador(equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, e.target.value)}
                  />
                ) : (
                  equipoSeleccionado.entrenador || 'Sin asignar'
                )}
              </p>
            </div>

            {token && (
              <div style={{ marginBottom: '16px' }}>
                <h4>Agregar jugador</h4>
                <form onSubmit={guardarJugador} className="grid-form">
                  <input
                    type="text" placeholder="Nombre y Apellido"
                    value={nuevoJugador.nombre}
                    onChange={e => setNuevoJugador({ ...nuevoJugador, nombre: e.target.value })}
                    required
                  />
                  <input
                    type="text" placeholder="Categoría"
                    value={nuevoJugador.categoria}
                    onChange={e => setNuevoJugador({ ...nuevoJugador, categoria: e.target.value })}
                    required
                  />
                  <input
                    type="number" placeholder="Pts anotados"
                    value={nuevoJugador.puntos_anotados}
                    onChange={e => setNuevoJugador({ ...nuevoJugador, puntos_anotados: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn-success">Añadir</button>
                </form>
              </div>
            )}

            <h4>Plantilla</h4>
            <table>
              <thead>
                <tr>
                  <th>Nombre y Apellido</th><th>Categoría</th><th>Pts</th>
                  {token && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {jugadores.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '12px' }}>Sin jugadores registrados.</td></tr>
                ) : jugadores.map(j => (
                  <tr key={j.id}>
                    {editandoJugadorId === j.id ? (
                      <>
                        <td><input className="edit-input" value={datosEdicionJugador.nombre} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, nombre: e.target.value })} /></td>
                        <td><input className="edit-input" value={datosEdicionJugador.categoria} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, categoria: e.target.value })} /></td>
                        <td><input className="edit-input" type="number" value={datosEdicionJugador.puntos_anotados} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, puntos_anotados: e.target.value })} /></td>
                        <td>
                          <button onClick={() => guardarCambiosJugador(j.id)}>💾</button>
                          <button onClick={() => setEditandoJugadorId(null)}>✖</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{j.nombre}</td>
                        <td>{j.categoria}</td>
                        <td>{j.puntos_anotados ?? j.Puntos_anotados ?? 0}</td>
                        {token && (
                          <td>
                            <button onClick={() => iniciarEdicionJugador(j)}>✏️</button>
                            <button onClick={() => eliminarJugador(j.id)}>🗑️</button>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 style={{ marginTop: '24px' }}>Partidos jugados</h4>
            {(() => {
              const eqId = equipoSeleccionado.equipo_id ?? equipoSeleccionado.id;
              const jugados = partidosDelEquipo(eqId).filter(p => p.jugado);
              return jugados.length === 0 ? (
                <p style={{ color: '#888' }}>Sin partidos jugados.</p>
              ) : jugados.map(p => {
                const res = resultadoParaEquipo(p, eqId);
                const esLocal = Number(p.equipo_local_id) === Number(eqId);
                return (
                  <div key={p.id} className="partido-item">
                    <div className="teams">
                      <span>{p.nombre_local}</span>
                      <span className="score">{p.puntos_local} — {p.puntos_visitante}</span>
                      <span>{p.nombre_visitante}</span>
                    </div>
                    <span className={res.cls}>{res.label} ({esLocal ? 'Local' : 'Visitante'})</span>
                  </div>
                );
              });
            })()}

            <h4 style={{ marginTop: '16px' }}>Partidos pendientes</h4>
            {(() => {
              const eqId = equipoSeleccionado.equipo_id ?? equipoSeleccionado.id;
              const pendientes = partidosDelEquipo(eqId).filter(p => !p.jugado);
              return pendientes.length === 0 ? (
                <p style={{ color: '#888' }}>Sin partidos pendientes.</p>
              ) : pendientes.map(p => (
                <div key={p.id} className="partido-item">
                  <div className="teams">
                    <span>{p.nombre_local}</span>
                    <span className="score">vs</span>
                    <span>{p.nombre_visitante}</span>
                  </div>
                  <div className="estadio-info">
                    📅 {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Fecha pendiente'}
                    &nbsp;·&nbsp;🕐 {p.horario || 'Horario pendiente'}
                    &nbsp;·&nbsp;📍 {p.lugar || 'Lugar pendiente'}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* ── CALENDARIO DE PARTIDOS ── */}
        {pestaña === 'partidos' && (
          <div className="card anim-fade">
            <h3>Calendario — {temporada}</h3>

            {editandoPartido && (
              <form
                onSubmit={guardarEdicionPartido}
                className="grid-form"
                style={{ marginBottom: '16px', background: '#f0f4ff', padding: '12px', borderRadius: '8px' }}
              >
                <h4 style={{ gridColumn: '1 / -1', margin: '0 0 8px' }}>
                  Editar: {editandoPartido.nombre_local} vs {editandoPartido.nombre_visitante}
                </h4>
                <div className="input-group">
                  <label>Fecha</label>
                  <input type="date" value={editandoPartido.fecha || ''} onChange={e => setEditandoPartido({ ...editandoPartido, fecha: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Horario</label>
                  <input type="time" value={editandoPartido.horario || ''} onChange={e => setEditandoPartido({ ...editandoPartido, horario: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Lugar</label>
                  <input type="text" placeholder="Nombre de la cancha" value={editandoPartido.lugar || ''} onChange={e => setEditandoPartido({ ...editandoPartido, lugar: e.target.value })} />
                </div>
                <button type="submit" className="btn-success">💾 Guardar</button>
                <button type="button" className="btn-cancel" onClick={() => setEditandoPartido(null)}>Cancelar</button>
              </form>
            )}

            {partidos.length === 0 ? (
              <p style={{ textAlign: 'center', margin: '20px' }}>Sin partidos generados para esta temporada.</p>
            ) : (
              partidos.map(p => (
                <div key={p.id} className="partido-item">
                  <div className="teams">
                    <span>{p.nombre_local}</span>
                    <span className="score">
                      {p.jugado ? `${p.puntos_local} — ${p.puntos_visitante}` : 'vs'}
                    </span>
                    <span>{p.nombre_visitante}</span>
                  </div>
                  <div className="estadio-info">
                    📅 {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Fecha pendiente'}
                    &nbsp;·&nbsp;🕐 {p.horario || 'Horario pendiente'}
                    &nbsp;·&nbsp;📍 {p.lugar || 'Lugar pendiente'}
                  </div>
                  {token && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        className="btn-edit-inline"
                        onClick={() => setEditandoPartido({
                          id: p.id,
                          nombre_local: p.nombre_local,
                          nombre_visitante: p.nombre_visitante,
                          fecha: p.fecha ? p.fecha.split('T')[0] : '',
                          horario: p.horario || '',
                          lugar: p.lugar || '',
                        })}
                      >
                        📋 Editar datos
                      </button>
                      <button
                        className="btn-edit-inline"
                        onClick={() => {
                          setResultadoData({
                            partidoId: p.id,
                            puntos_local: p.puntos_local || 0,
                            puntos_visitante: p.puntos_visitante || 0,
                          });
                          setPestaña('cargar');
                        }}
                      >
                        ✏️ Marcador
                      </button>
                      <button
                        className="btn-delete-inline"
                        onClick={() => eliminarPartido(p.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CARGAR RESULTADO ── */}
        {pestaña === 'cargar' && (
          <div className="card anim-fade">
            <h3>Actualizar Marcador</h3>
            <form onSubmit={enviarResultado} className="grid-form">
              <div className="input-group">
                <label>Puntos Local</label>
                <input
                  type="number" min="0"
                  value={resultadoData.puntos_local}
                  onChange={e => setResultadoData({ ...resultadoData, puntos_local: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Puntos Visitante</label>
                <input
                  type="number" min="0"
                  value={resultadoData.puntos_visitante}
                  onChange={e => setResultadoData({ ...resultadoData, puntos_visitante: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-success">Guardar</button>
              <button type="button" className="btn-cancel" onClick={() => setPestaña('partidos')}>Cancelar</button>
            </form>
          </div>
        )}

        {/* ── PANEL DE GESTIÓN (solo admin) ── */}
        {pestaña === 'gestion' && token && (
          <div className="card anim-fade">
            <h3>Panel de Gestión</h3>

            <h4>Crear equipo</h4>
            <form onSubmit={crearEquipo} className="grid-form">
              <input
                type="text"
                placeholder="Nombre del Equipo"
                value={nuevoEquipo.nombre}
                onChange={e => setNuevoEquipo({ ...nuevoEquipo, nombre: e.target.value })}
                required
              />
              <select
                value={nuevoEquipo.temporadaEquipo}
                onChange={e => setNuevoEquipo({ ...nuevoEquipo, temporadaEquipo: e.target.value })}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
              >
                <option value="2025-2">Temporada 2025-II</option>
                <option value="2026-2">Temporada 2026-II</option>
              </select>
              <button type="submit" className="btn-success">Crear Equipo</button>
            </form>

            <div className="btn-group-vertical" style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px' }}>
                Las siguientes acciones aplican a la temporada seleccionada en el encabezado: <strong>{temporada}</strong>
              </p>
              <button className="btn-primary" onClick={generarCalendarioAleatorio}>
                🔄 Generar Calendario Todo vs Todo (ida y vuelta)
              </button>
              <button className="btn-danger" onClick={reiniciarTodo}>
                ⚠️ Reiniciar Temporada
              </button>
            </div>
          </div>
        )}

        {/* ── LOGIN ── */}
        {pestaña === 'login' && !token && (
          <div className="card anim-fade login-card">
            <h3>Acceso Administrativo</h3>
            <form onSubmit={handleLogin}>
              <input
                type="text" placeholder="Usuario"
                onChange={e => setLoginData({ ...loginData, usuario: e.target.value })}
                required
              />
              <input
                type="password" placeholder="Clave"
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">Entrar</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;