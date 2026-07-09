/**
 * Contexto Principal de la Aplicacian (AppContext).
 * Provee el estado global para equipos, jugadores, partidos, temporadas y autenticacian.
 */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AuthService, ClasificacionService, EquipoService, JugadorService, PartidoService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { useModal } from './ModalContext';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// API Base handled by apiService.js

// Verifica si un JWT (sin verificar firma, solo decodificando payload) está expirado.
// La verificación real de la firma ocurre en el servidor; esto solo evita enviar
// tokens claramente vencidos desde el cliente.
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp && Date.now() / 1000 > payload.exp;
  } catch {
    return true; // token malformado → tratar como expirado
  }
};

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();

  // ── NAVEGACIÓN ──────────────────────────────────────────────────────────────
  const [temporada, setTemporada] = useState(localStorage.getItem('temporada') || '2026-2');
  const [categoriaGlobal, setCategoriaGlobal] = useState('Profesional');
  const [temporadas, setTemporadas] = useState(['2025-2', '2026-2']);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token') || '';
    // Si el token guardado ya está expirado, lo descartamos de inmediato.
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('token');
      return '';
    }
    return stored;
  });
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
  }, [temporada, categoriaGlobal]);

  // ── SINCRONIZAR SELECTOR DE TEMPORADA Y RESETEAR GUARD ──────────────────────
  useEffect(() => {
    setNuevoEquipo(prev => ({ ...prev, temporadaEquipo: temporada }));
    creandoEquipo.current = false;
  }, [temporada]);

  const cargarTemporadas = async () => {
    startLoading();
    try {
      const res = await ClasificacionService.getTemporadas();
      if (res && res.length > 0) {
        setTemporadas(res);
        setTemporada(prev => {
          if (!res.includes(prev)) {
            const lastSeason = res[res.length - 1];
            localStorage.setItem('temporada', lastSeason);
            return lastSeason;
          }
          return prev;
        });
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
      const data = await ClasificacionService.getClasificacion(t, categoriaGlobal);
      setEquipos(data);
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
      const data = await PartidoService.getPartidos(t, categoriaGlobal);
      setPartidos(data);
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
      const data = await AuthService.login(loginData);
      const nuevoToken = data.token;
      setToken(nuevoToken);
      localStorage.setItem('token', nuevoToken);
      navigate('/clasificacion');
    } catch (err) {
      // Distinguir entre error de credenciales (401) y error del servidor (4xx/5xx)
      if (err.response?.status === 401) {
        await showAlert('⚠️ Usuario o contraseña incorrectos.');
      } else if (err.response?.status === 429) {
        await showAlert('⚠️ Demasiados intentos. Esperá 15 minutos e intentá de nuevo.');
      } else {
        await showAlert('⚠️ Error del servidor al iniciar sesión. Revisá que JWT_SECRET esté configurado en Render.');
      }
      console.error('[handleLogin]', err.response?.status, err.response?.data || err.message);
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
      return await showAlert('⚠️ El nombre del equipo es obligatorio.');
    }

    const temporadaDestino = nuevoEquipo.temporadaEquipo || temporada;

    try {
      await EquipoService.crear({ nombre: nuevoEquipo.nombre.trim(), temporada: temporadaDestino, categoria: categoriaGlobal });
      await showAlert(`✅ Equipo "${nuevoEquipo.nombre.trim()}" creado en la Temporada ${temporadaDestino}`);
      setNuevoEquipo({ nombre: '', temporadaEquipo: temporadaDestino });
      if (temporadaDestino === temporada) cargarEquipos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ ' + (err.response?.data?.msg || 'Error al crear equipo'));
    } finally {
      creandoEquipo.current = false;
    }
  };

  const eliminarEquipo = async (id) => {
    const ok = await showConfirm('¿Eliminar equipo? Se borrarán sus jugadores y partidos pendientes.');
    if (!ok) return;
    try {
      await EquipoService.eliminar(id, temporada, categoriaGlobal);
      cargarEquipos(temporada);
      cargarPartidos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ ' + (err.response?.data?.msg || 'Error al eliminar equipo'));
    }
  };

  const guardarEntrenador = async (id, nuevoNombre) => {
    try {
      await EquipoService.actualizarEntrenador(id, nuevoNombre);
      setEquipoSeleccionado(prev => ({ ...prev, entrenador: nuevoNombre }));
      cargarEquipos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al actualizar el entrenador.');
    }
  };

  const subirLogoArchivo = async (id, archivo) => {
    if (!archivo) return;
    const formData = new FormData();
    formData.append('logo', archivo);

    try {
      const data = await EquipoService.subirLogo(id, formData);
      setEquipoSeleccionado(prev => ({ ...prev, logo: data.logo }));
      cargarEquipos(temporada);
      await showAlert('✅ Escudo actualizado correctamente.');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al subir el escudo.');
    }
  };

  // ── GESTIÓN DE JUGADORES ─────────────────────────────────────────────────────
  // Referencia para cancelar peticiones obsoletas de verJugadores
  const verJugadoresRequestId = useRef(0);

  const verJugadores = async (equipo) => {
    verJugadoresRequestId.current += 1;
    const currentRequestId = verJugadoresRequestId.current;

    setEquipoSeleccionado(equipo);
    setEditandoJugadorId(null);
    startLoading();
    try {
      const [resJugadores, resPartidos] = await Promise.all([
        JugadorService.getByEquipo(equipo.equipo_id ?? equipo.id, temporada, categoriaGlobal),
        PartidoService.getPartidos(temporada, categoriaGlobal)
      ]);
      
      // Si el id de petición cambió, significa que se inició otra consulta más reciente
      if (currentRequestId !== verJugadoresRequestId.current) return;

      setJugadores(resJugadores);
      setPartidos(resPartidos);
      navigate(`/equipo/${equipo.equipo_id ?? equipo.id}`);
      window.scrollTo(0, 0);
    } catch {
      await showAlert('⚠️ Error al cargar la plantilla.');
    } finally {
      if (currentRequestId === verJugadoresRequestId.current) {
        stopLoading();
      }
    }
  };

  const guardarJugador = async (e) => {
    e.preventDefault();
    if (!nuevoJugador.nombre.trim() || !nuevoJugador.categoria.trim()) {
      return await showAlert('⚠️ Nombre y categoría son obligatorios.');
    }
    try {
      await JugadorService.crear({ ...nuevoJugador, equipo_id: equipoSeleccionado.equipo_id ?? equipoSeleccionado.id, temporada, categoria: categoriaGlobal });
      setNuevoJugador({ nombre: '', categoria: '', puntos_anotados: '' });
      verJugadores(equipoSeleccionado);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al guardar jugador.');
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
      await JugadorService.actualizar(id, { ...datosEdicionJugador, temporada, categoria: categoriaGlobal });
      setEditandoJugadorId(null);
      verJugadores(equipoSeleccionado);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al actualizar jugador.');
    }
  };

  const eliminarJugador = async (id) => {
    const ok = await showConfirm('¿Eliminar jugador?');
    if (!ok) return;
    try {
      await JugadorService.eliminar(id);
      verJugadores(equipoSeleccionado);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al eliminar jugador.');
    }
  };

  const subirFotoJugador = async (id, archivo) => {
    if (!archivo) return;
    const formData = new FormData();
    formData.append('foto', archivo);

    try {
      await JugadorService.subirFoto(id, formData);
      verJugadores(equipoSeleccionado);
      await showAlert('✅ Foto del jugador actualizada correctamente.');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al subir la foto del jugador.');
    }
  };

  // Fetch players for any team by ID (used in CargarResultado)
  const fetchJugadoresEquipo = async (equipoId, temp, cat) => {
    try {
      const t = temp ?? temporada;
      const c = cat ?? categoriaGlobal;
      const data = await JugadorService.getByEquipo(equipoId, t, c);
      return data;
    } catch (err) {
      console.error('[fetchJugadoresEquipo]', err);
      return [];
    }
  };

  // Update only a player's points (quick update from match result screen)
  const actualizarPuntosJugador = async (jugadorId, nuevosPuntos, temp) => {
    try {
      const t = temp ?? temporada;
      await JugadorService.sumarPuntos(jugadorId, { puntos_anotados: nuevosPuntos, temporada: t, categoria: categoriaGlobal });
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      throw err;
    }
  };

  // ── GESTIÓN DE PARTIDOS ──────────────────────────────────────────────────────
  const enviarResultado = async (e) => {
    e.preventDefault();
    const pl = parseInt(resultadoData.puntos_local);
    const pv = parseInt(resultadoData.puntos_visitante);
    if (isNaN(pl) || isNaN(pv) || pl < 0 || pv < 0) {
      return await showAlert('⚠️ Los puntos deben ser números no negativos.');
    }
    startLoading();
    try {
      await PartidoService.enviarResultado(resultadoData.partidoId, { ...resultadoData, temporada, categoria: categoriaGlobal });
      await showAlert('✅ Marcador guardado y clasificación actualizada.');
      setResultadoData({ partidoId: '', puntos_local: '', puntos_visitante: '' });
      await cargarEquipos(temporada);
      await cargarPartidos(temporada);
      navigate('/clasificacion');
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al guardar el resultado:\n' + (err.response?.data?.error || err.message));
    } finally {
      stopLoading();
    }
  };

  const guardarEdicionPartido = async (e) => {
    e.preventDefault();
    try {
      await PartidoService.actualizar(editandoPartido.id, {
        fecha: editandoPartido.fecha || null,
        horario: editandoPartido.horario || null,
        lugar: editandoPartido.lugar || null,
      });
      setEditandoPartido(null);
      cargarPartidos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al editar partido:\n' + (err.response?.data?.error || err.message));
    }
  };

  const eliminarPartido = async (id) => {
    const ok = await showConfirm('¿Eliminar este partido?');
    if (!ok) return;
    try {
      await PartidoService.eliminar(id, temporada, categoriaGlobal);
      cargarPartidos(temporada);
      cargarEquipos(temporada);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al eliminar partido:\n' + (err.response?.data?.error || err.message));
    }
  };

  const generarCalendarioAleatorio = async () => {
    if (equipos.length < 2) return await showAlert('⚠️ Necesitás al menos 2 equipos.');
    const ok = await showConfirm(`📅 ¿Generar calendario Todo vs Todo (ida y vuelta) para la Temporada ${temporada}?`);
    if (!ok) return;

    const cruces = [];
    for (let i = 0; i < equipos.length; i++) {
      for (let j = 0; j < equipos.length; j++) {
        if (i === j) continue;
        cruces.push({
          equipo_local_id: equipos[i].equipo_id ?? equipos[i].id,
          equipo_visitante_id: equipos[j].equipo_id ?? equipos[j].id,
          temporada,
          categoria: categoriaGlobal
        });
      }
    }

    const shuffled = cruces.sort(() => Math.random() - 0.5);
    const errores = [];

    startLoading();
    try {
      for (const partido of shuffled) {
        try {
          await PartidoService.crear(partido);
        } catch (err) {
          if (err.response?.status === 401) { handleLogout(); return; }
          if (err.response?.status !== 409) {
            errores.push(err.response?.data?.msg || err.message);
          }
        }
      }

      if (errores.length > 0) {
        await showAlert(`⚠️ Calendario generado con ${errores.length} error(es):\n${errores.slice(0, 3).join('\n')}`);
      } else {
        await showAlert('📅 Calendario ida y vuelta generado correctamente.');
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
    const ok = await showConfirm(`📅 ¿Iniciar la siguiente temporada ${formatearTemporada(siguienteTemporada)}?\nSe conservará el histórico de la temporada actual (${formatearTemporada(temporada)}) y se registrarán los mismos equipos en la nueva temporada con 0 puntos.`);
    if (!ok) return;
    startLoading();
    try {
      await PartidoService.siguienteTemporada(temporada, siguienteTemporada, categoriaGlobal);
      await cargarTemporadas();
      setTemporada(siguienteTemporada);
      navigate('/clasificacion');
      await showAlert(`✅ Nueva temporada ${formatearTemporada(siguienteTemporada)} iniciada con éxito.`);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ Error al iniciar siguiente temporada:\n' + (err.response?.data?.error || err.message));
    } finally {
      stopLoading();
    }
  };

  // ── GESTIÓN DE TEMPORADAS ────────────────────────────────────────────────────
  const eliminarTemporada = async (temp) => {
    if (temporadas.length <= 1) {
      return await showAlert('⚠️ No podés eliminar la única temporada existente.');
    }
    const ok = await showConfirm(
      `⚠️ ¿Eliminar la ${formatearTemporada(temp)}?\n\n` +
      `Se borrarán TODOS sus partidos, clasificación y equipos.\n` +
      `Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    startLoading();
    try {
      await PartidoService.eliminarTemporada(temp, categoriaGlobal);

      const otraTemporada = temporadas.find(t => t !== temp);
      await cargarTemporadas();

      // Si la temporada eliminada era la activa, cambiar a otra
      if (temporada === temp) {
        setTemporada(otraTemporada);
        navigate('/clasificacion');
      }

      await showAlert(`✅ ${formatearTemporada(temp)} eliminada correctamente.`);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      await showAlert('⚠️ ' + (err.response?.data?.error || 'Error al eliminar la temporada.'));
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
    temporada, setTemporada: (val) => { setTemporada(val); localStorage.setItem('temporada', val); },
    categoriaGlobal, setCategoriaGlobal,
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
    subirFotoJugador,
    fetchJugadoresEquipo,
    actualizarPuntosJugador,

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