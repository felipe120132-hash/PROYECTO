import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const API = 'https://proyecto-4t2l.onrender.com/api';

export function AppProvider({ children }) {
  const navigate = useNavigate();

  // ── NAVEGACIÓN ──────────────────────────────────────────────────────────────
  const [temporada, setTemporada] = useState('2026-2');
  const [temporadas, setTemporadas] = useState(['2025-2', '2026-2']);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loginData, setLoginData] = useState({ usuario: '', password: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCount, setLoadingCount] = useState(0);
  const loading = loadingCount > 0;
  const startLoading = () => setLoadingCount(c => c + 1);
  const stopLoading = () => setLoadingCount(c => Math.max(0, c - 1));

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
    startLoading();
    try {
      const res = await axios.get(`${API}/clasificacion/temporadas`);
      if (res.data && res.data.length > 0) {
        setTemporadas(res.data);
      }
    } catch (err) {
      console.error('[cargarTemporadas]', err);
    } finally {
      stopLoading();
    }
  };

  const cargarEquipos = async (temp) => {
    const t = temp ?? temporada;
    startLoading();
    try {
      const res = await axios.get(`${API}/clasificacion?temporada=${t}`);
      setEquipos(res.data);
    } catch (err) {
      console.error('[cargarEquipos]', err);
      setEquipos([]);
    } finally {
      stopLoading();
    }
  };

  const cargarPartidos = async (temp) => {
    const t = temp ?? temporada;
    startLoading();
    try {
      const res = await axios.get(`${API}/partidos?temporada=${t}`);
      setPartidos(res.data);
    } catch (err) {
      console.error('[cargarPartidos]', err);
      setPartidos([]);
    } finally {
      stopLoading();
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
      navigate('/clasificacion');
    } catch (err) {
      alert('Credenciales incorrectas o sesión no autorizada.');
      console.error(err);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    navigate('/clasificacion');
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
    startLoading();
    try {
      const [resJugadores, resPartidos] = await Promise.all([
        axios.get(`${API}/jugadores/equipo/${equipo.equipo_id ?? equipo.id}`),
        axios.get(`${API}/partidos?temporada=${temporada}`)
      ]);
      setJugadores(resJugadores.data);
      setPartidos(resPartidos.data);
      navigate(`/equipo/${equipo.equipo_id ?? equipo.id}`);
      window.scrollTo(0, 0);
    } catch {
      alert('Error al cargar la plantilla.');
    } finally {
      stopLoading();
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
    startLoading();
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
      navigate('/clasificacion');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al guardar el resultado:\n' + (err.response?.data?.error || err.message));
    } finally {
      stopLoading();
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

    startLoading();
    try {
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

      await cargarPartidos(temporada);
      navigate('/partidos');
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  const reiniciarTodo = async () => {
    const siguienteTemporada = obtenerTemporadaSiguiente(temporada);
    if (!window.confirm(`¿Iniciar la siguiente temporada ${formatearTemporada(siguienteTemporada)}?\nSe conservará el histórico de la temporada actual (${formatearTemporada(temporada)}) y se registrarán los mismos equipos en la nueva temporada con 0 puntos.`)) return;
    startLoading();
    try {
      await axios.post(`${API}/partidos/siguiente-temporada`, { temporada, siguienteTemporada }, authHeader());
      await cargarTemporadas();
      setTemporada(siguienteTemporada);
      navigate('/clasificacion');
      alert(`✅ Nueva temporada ${formatearTemporada(siguienteTemporada)} iniciada con éxito.`);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ Error al iniciar siguiente temporada:\n' + (err.response?.data?.error || err.message));
    } finally {
      stopLoading();
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

    startLoading();
    try {
      await axios.delete(`${API}/partidos/temporada?temporada=${temp}`, authHeader());

      const otraTemporada = temporadas.find(t => t !== temp);
      await cargarTemporadas();

      // Si la temporada eliminada era la activa, cambiar a otra
      if (temporada === temp) {
        setTemporada(otraTemporada);
        navigate('/clasificacion');
      }

      alert(`✅ ${formatearTemporada(temp)} eliminada correctamente.`);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      alert('⚠️ ' + (err.response?.data?.error || 'Error al eliminar la temporada.'));
    } finally {
      stopLoading();
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

  const value = {
    // State
    temporada, setTemporada,
    temporadas, setTemporadas,
    token, setToken,
    loginData, setLoginData,
    menuOpen, setMenuOpen,
    searchTerm, setSearchTerm,
    loading,
    equipos, setEquipos,
    partidos, setPartidos,
    jugadores, setJugadores,
    equipoSeleccionado, setEquipoSeleccionado,
    nuevoJugador, setNuevoJugador,
    editandoJugadorId, setEditandoJugadorId,
    datosEdicionJugador, setDatosEdicionJugador,
    nuevoEquipo, setNuevoEquipo,
    resultadoData, setResultadoData,
    editandoPartido, setEditandoPartido,

    // Helpers
    authHeader,
    formatearTemporada,
    obtenerTemporadaSiguiente,

    // Data loading
    cargarTemporadas,
    cargarEquipos,
    cargarPartidos,

    // Auth
    handleLogin,
    handleLogout,

    // Team management
    crearEquipo,
    eliminarEquipo,
    guardarEntrenador,
    subirLogoArchivo,

    // Player management
    verJugadores,
    guardarJugador,
    iniciarEdicionJugador,
    guardarCambiosJugador,
    eliminarJugador,

    // Match management
    enviarResultado,
    guardarEdicionPartido,
    eliminarPartido,
    generarCalendarioAleatorio,
    reiniciarTodo,

    // Season management
    eliminarTemporada,

    // View helpers
    partidosDelEquipo,
    resultadoParaEquipo,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
