import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import heroBg from './assets/hero_bg.jpg';
import mvpImg from './assets/mvp_player.png';

const API = 'https://proyecto-4t2l.onrender.com/api';

function App() {
  // ── NAVEGACIÓN ──────────────────────────────────────────────────────────────
  const [pestaña, setPestaña] = useState('landing');
  const [temporada, setTemporada] = useState('2026-2');
  const [temporadas, setTemporadas] = useState(['2025-2', '2026-2']);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loginData, setLoginData] = useState({ usuario: '', password: '' });
  const [menuOpen, setMenuOpen] = useState(false);

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

  const formatearTemporada = (temp) => {
    if (!temp) return '';
    const partes = temp.split('-');
    if (partes.length < 2) return `Temporada ${temp}`;
    const anio = partes[0];
    const periodo = partes[1];
    const romano = periodo === '1' ? 'I' : (periodo === '2' ? 'II' : periodo);
    return `Temporada ${anio}-${romano}`;
  };

  const obtenerTemporadaSiguiente = (temp) => {
    if (!temp) return '2026-2';
    const partes = temp.split('-');
    if (partes.length < 2) return `${temp}-2`;
    const anio = parseInt(partes[0]);
    const periodo = partes[1];
    if (periodo === '1') {
      return `${anio}-2`;
    } else {
      return `${anio + 1}-1`;
    }
  };

  // ── CARGA DE DATOS ───────────────────────────────────────────────────────────
  useEffect(() => {
    cargarTemporadas();
  }, []);

  useEffect(() => {
    setEquipos([]);
    setPartidos([]);
    cargarEquipos(temporada);
    cargarPartidos(temporada);
  }, [temporada]);

  // ── SINCRONIZAR SELECTOR DE TEMPORADA Y RESETEAR GUARD ──────────────────────
  useEffect(() => {
    setNuevoEquipo(prev => ({ ...prev, temporadaEquipo: temporada }));
    creandoEquipo.current = false;
  }, [temporada]);

  const cargarTemporadas = async () => {
    try {
      const res = await axios.get(`${API}/clasificacion/temporadas`);
      if (res.data && res.data.length > 0) {
        setTemporadas(res.data);
      }
    } catch (err) {
      console.error('[cargarTemporadas]', err);
    }
  };

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
    setMenuOpen(false);
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

  const subirLogoArchivo = async (id, archivo) => {
    if (!archivo) return;
    const formData = new FormData();
    formData.append('logo', archivo);

    try {
      const res = await axios.put(`${API}/equipos/${id}/logo`, formData, {
        headers: {
          ...authHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      setEquipoSeleccionado(prev => ({ ...prev, logo: res.data.logo }));
      cargarEquipos(temporada);
      alert('✅ Escudo actualizado correctamente.');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('Error al subir el escudo.');
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
      window.scrollTo(0, 0);
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
    const siguienteTemporada = obtenerTemporadaSiguiente(temporada);
    if (!window.confirm(`¿Iniciar la siguiente temporada ${formatearTemporada(siguienteTemporada)}?\nSe conservará el histórico de la temporada actual (${formatearTemporada(temporada)}) y se registrarán los mismos equipos en la nueva temporada con 0 puntos.`)) return;
    try {
      await axios.post(`${API}/partidos/siguiente-temporada`, { temporada, siguienteTemporada }, authHeader());
      await cargarTemporadas();
      setTemporada(siguienteTemporada);
      setPestaña('clasificacion');
      alert(`✅ Nueva temporada ${formatearTemporada(siguienteTemporada)} iniciada con éxito.`);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al iniciar siguiente temporada:\n' + (err.response?.data?.error || err.message));
    }
  };

  // ── GESTIÓN DE TEMPORADAS ────────────────────────────────────────────────────
  const eliminarTemporada = async (temp) => {
    if (temporadas.length <= 1) {
      return alert('No podés eliminar la única temporada existente.');
    }
    if (!window.confirm(
      `¿Eliminar la ${formatearTemporada(temp)}?\n\n` +
      `⚠️ Se borrarán TODOS sus partidos, clasificación y equipos.\n` +
      `Esta acción no se puede deshacer.`
    )) return;

    try {
      await axios.delete(`${API}/partidos/temporada?temporada=${temp}`, authHeader());

      const otraTemporada = temporadas.find(t => t !== temp);
      await cargarTemporadas();

      // Si la temporada eliminada era la activa, cambiar a otra
      if (temporada === temp) {
        setTemporada(otraTemporada);
        setPestaña('clasificacion');
      }

      alert(`✅ ${formatearTemporada(temp)} eliminada correctamente.`);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ ' + (err.response?.data?.error || 'Error al eliminar la temporada.'));
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

  const navigateTo = (p) => {
    setPestaña(p);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      {/* Overlay para cerrar menu mobile */}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

      <aside className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}>
        <div className="user-profile">
          <div className="avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Usuario" />
          </div>
          <div className="user-info">
            <h4>PRO DIVISION</h4>
            <p>Temporada {temporada}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${pestaña === 'landing' ? 'active' : ''}`} onClick={() => navigateTo('landing')}>
            <span> INICIO</span>
          </button>
          <button className={`nav-item ${pestaña === 'equipos' ? 'active' : ''}`} onClick={() => navigateTo('equipos')}>
            <span> EQUIPOS</span>
          </button>
          <button className={`nav-item ${pestaña === 'clasificacion' ? 'active' : ''}`} onClick={() => navigateTo('clasificacion')}>
            <span> RESULTADOS</span>
          </button>
          <button className={`nav-item ${pestaña === 'partidos' ? 'active' : ''}`} onClick={() => navigateTo('partidos')}>
            <span> CALENDARIO</span>
          </button>
          {token && (
            <>
              <button className={`nav-item ${pestaña === 'gestion' ? 'active' : ''}`} onClick={() => navigateTo('gestion')}>
                <span> AJUSTES</span>
              </button>
              <button className={`nav-item ${pestaña === 'temporadas' ? 'active' : ''}`} onClick={() => navigateTo('temporadas')}>
                <span> TEMPORADAS</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-label">Temporada activa</p>
          <select className="season-select sidebar-select" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
            {temporadas.map(temp => (
              <option key={temp} value={temp}>{formatearTemporada(temp)}</option>
            ))}
          </select>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
            <div className="brand">LA SUPER LIGA</div>
          </div>
          
          <nav className="top-nav">
            <span className={pestaña === 'landing' ? 'active' : ''} onClick={() => setPestaña('landing')}>Inicio</span>
            <span className={pestaña === 'partidos' ? 'active' : ''} onClick={() => setPestaña('partidos')}>Calendario</span>
            <span className={pestaña === 'equipos' ? 'active' : ''} onClick={() => setPestaña('equipos')}>Equipos</span>
            <span className={pestaña === 'clasificacion' ? 'active' : ''} onClick={() => setPestaña('clasificacion')}>Estadísticas</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ cursor: 'pointer', fontSize: '20px' }}></span>
            {token ? (
              <button className="login-btn" onClick={handleLogout}>Cerrar Sesión</button>
            ) : (
              <button className="login-btn" onClick={() => setPestaña('login')}>
                👤 Iniciar Sesión
              </button>
            )}
          </div>
        </header>

        <main className="content-area">

        {/* ── LANDING PAGE ── */}
        {pestaña === 'landing' && (
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
                <button className="btn-primary" onClick={() => setPestaña('clasificacion')}>
                   Ver Clasificación
                </button>
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
                {equipos.length > 0 ? equipos.map((eq, i) => (
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
                        <span className="metric-val metric-pos">{i + 1}º</span>
                        <span className="metric-label">Posición</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b' }}>
                    Sin equipos registrados para esta temporada.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── SECCIÓN DE EQUIPOS ── */}
        {pestaña === 'equipos' && (
          <div className="table-card anim-fade">
            <section className="teams-section">
              <div className="section-header">
                <span></span>
                <h2>Equipos de la Temporada {temporada}</h2>
              </div>
              <div className="teams-grid">
                {equipos.length > 0 ? equipos.map((eq, i) => (
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
                        <span className="metric-val metric-pos">{i + 1}º</span>
                        <span className="metric-label">Posición</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: '#64748b' }}>
                    Sin equipos registrados para esta temporada.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── TABLA DE CLASIFICACIÓN ── */}
        {pestaña === 'clasificacion' && (
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
        )}

        {/* ── VISTA POR EQUIPO ── */}
        {pestaña === 'jugadores' && equipoSeleccionado && (
          <div className="table-card anim-fade">
            <button className="btn-cancel" onClick={() => setPestaña('clasificacion')} style={{ marginBottom: '20px' }}>
              <span>←</span> Volver a Clasificación
            </button>

            <div className="section-header-flex">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div className="team-logo-circle" style={{ marginBottom: 0, width: '100px', height: '100px', fontSize: '32px' }}>
                   {equipoSeleccionado.logo ? (
                     <img src={equipoSeleccionado.logo} alt={equipoSeleccionado.nombre} />
                   ) : (
                     equipoSeleccionado.nombre.substring(0, 2).toUpperCase()
                   )}
                </div>
                <div>
                  <h2> {equipoSeleccionado.nombre}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong>DT:</strong>
                      {token ? (
                        <input
                          type="text"
                          className="season-select"
                          style={{ padding: '4px 12px', fontSize: '13px' }}
                          value={equipoSeleccionado.entrenador || ''}
                          onChange={(e) => setEquipoSeleccionado({ ...equipoSeleccionado, entrenador: e.target.value })}
                          onBlur={(e) => guardarEntrenador(equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, e.target.value)}
                        />
                      ) : (
                        equipoSeleccionado.entrenador || 'Sin asignar'
                      )}
                    </p>
                    {token && (
                      <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong>Cambiar Escudo:</strong>
                        <input
                          type="file"
                          accept="image/*"
                          className="season-select"
                          style={{ padding: '4px 12px', fontSize: '13px', width: '220px' }}
                          onChange={(e) => subirLogoArchivo(equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, e.target.files[0])}
                        />
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {token && (
              <div style={{ marginBottom: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                <h4>Añadir Jugador a la Plantilla</h4>
                <form onSubmit={guardarJugador} className="grid-form">
                  <input
                    type="text" placeholder="Nombre y Apellido"
                    value={nuevoJugador.nombre}
                    onChange={e => setNuevoJugador({ ...nuevoJugador, nombre: e.target.value })}
                    className="season-select"
                    required
                  />
                  <input
                    type="text" placeholder="Categoría (ej. Sub-18)"
                    value={nuevoJugador.categoria}
                    onChange={e => setNuevoJugador({ ...nuevoJugador, categoria: e.target.value })}
                    className="season-select"
                    required
                  />
                  <input
                    type="number" placeholder="Puntos"
                    value={nuevoJugador.puntos_anotados}
                    onChange={e => setNuevoJugador({ ...nuevoJugador, puntos_anotados: e.target.value })}
                    className="season-select"
                    required
                  />
                  <button type="submit" className="btn-success">Añadir</button>
                </form>
              </div>
            )}

            <h4>Plantilla del Equipo</h4>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Jugador</th><th>Categoría</th><th>Puntos Totales</th>
                    {token && <th>Acciones</th>}
                  </tr>
                </thead>
              <tbody>
                {jugadores.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '12px' }}>Sin jugadores registrados.</td></tr>
                ) : (
                  jugadores.map(j => (
                    <tr key={j.id}>
                      {editandoJugadorId === j.id ? (
                        <>
                          <td><input className="edit-input" value={datosEdicionJugador.nombre} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, nombre: e.target.value })} /></td>
                          <td><input className="edit-input" value={datosEdicionJugador.categoria} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, categoria: e.target.value })} /></td>
                          <td><input className="edit-input" type="number" value={datosEdicionJugador.puntos_anotados} onChange={e => setDatosEdicionJugador({ ...datosEdicionJugador, puntos_anotados: e.target.value })} /></td>
                          <td>
                            <button className="btn-edit-inline" onClick={() => guardarCambiosJugador(j.id)} style={{ marginRight: '4px' }}>💾</button>
                            <button className="btn-delete-inline" onClick={() => setEditandoJugadorId(null)}>✖</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{j.nombre}</td>
                          <td>{j.categoria}</td>
                          <td>{j.puntos_anotados ?? j.Puntos_anotados ?? 0}</td>
                          {token && (
                            <td>
                              <button className="btn-edit-inline" onClick={() => iniciarEdicionJugador(j)} style={{ marginRight: '4px' }}>✏️</button>
                              <button className="btn-delete-inline" onClick={() => eliminarJugador(j.id)}>🗑️</button>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                    <span className="score"> vs </span>
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
          <div className="table-card anim-fade">
            <div className="section-header">
              <span>🗓️</span>
              <h2>Calendario de Partidos</h2>
            </div>

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
              <div className="calendar-grid">
                {partidos.map(p => (
                  <div key={p.id} className="partido-item anim-fade">
                    <div className="match-main">
                      <div className="match-team team-local">
                        <span>{p.nombre_local}</span>
                        <div className="team-icon-sm">
                           {p.logo_local ? <img src={p.logo_local} alt={p.nombre_local} /> : p.nombre_local.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      
                      {p.jugado ? (
                        <div className="match-score-badge">
                          {p.puntos_local} — {p.puntos_visitante}
                        </div>
                      ) : (
                        <div className="match-vs-badge">VS</div>
                      )}

                      <div className="match-team team-visitante">
                        <div className="team-icon-sm">
                           {p.logo_visitante ? <img src={p.logo_visitante} alt={p.nombre_visitante} /> : p.nombre_visitante.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{p.nombre_visitante}</span>
                      </div>
                    </div>

                    <div className="match-details">
                      <div className="detail-item">
                        <span>📅</span> {p.fecha ? new Date(p.fecha).toLocaleDateString('es-AR') : 'Pendiente'}
                      </div>
                      <div className="detail-item">
                        <span>🕐</span> {p.horario || 'Pendiente'}
                      </div>
                      <div className="detail-item">
                        <span>📍</span> {p.lugar || 'Cancha por asignar'}
                      </div>
                    </div>

                    {token && (
                      <div className="match-actions">
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
                          📋 Datos
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
                        <button className="btn-delete-inline" onClick={() => eliminarPartido(p.id)}>
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CARGAR RESULTADO ── */}
        {pestaña === 'cargar' && (
          <div className="table-card anim-fade">
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
          <div className="table-card anim-fade">
            <div className="section-header">
              <span></span>
              <h2>Panel de Gestión Administrativa</h2>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4>Crear Nuevo Equipo</h4>
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
                  className="season-select"
                >
                  {temporadas.map(temp => (
                    <option key={temp} value={temp}>{formatearTemporada(temp)}</option>
                  ))}
                </select>
                <button type="submit" className="btn-success">Crear Equipo</button>
              </form>
            </div>

            <div className="btn-group-vertical">
              <h4>Acciones Globales</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Las siguientes acciones aplican a la temporada seleccionada: <strong>{temporada}</strong>
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={generarCalendarioAleatorio}>
                  🔄 Generar Calendario Todo vs Todo
                </button>
                <button className="btn-danger" onClick={reiniciarTodo}>
                  ⚠️ Iniciar Siguiente Temporada
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL DE TEMPORADAS (solo admin) ── */}
        {pestaña === 'temporadas' && token && (
          <div className="table-card anim-fade">
            <div className="section-header">
              <span></span>
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
                ⚠️ No podés eliminar la única temporada existente. Creá una nueva temporada primero desde el panel de Ajustes.
              </p>
            )}
          </div>
        )}

        {/* ── LOGIN ── */}
        {pestaña === 'login' && !token && (
          <div className="table-card anim-fade login-card" style={{ maxWidth: '400px', margin: '60px auto' }}>
            <div className="section-header" style={{ justifyContent: 'center' }}>
              <span>👤</span>
              <h2>Acceso Administrativo</h2>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Usuario</label>
                <input
                  type="text" placeholder="Tu nombre de usuario"
                  onChange={e => setLoginData({ ...loginData, usuario: e.target.value })}
                  className="season-select"
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <input
                  type="password" placeholder="Tu clave de acceso"
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  className="season-select"
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Entrar al Panel</button>
            </form>
          </div>
        )}

      </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="brand">LA SUPER LIGA </div>
            <div className="footer-links">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <p className="copyright"></p>
        </footer>
      </div>
    </div>
  );
}

export default App;