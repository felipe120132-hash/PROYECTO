import api from './api';

/**
 * Servicio de autenticación.
 * Maneja el inicio de sesión de usuarios administradores.
 */

export const AuthService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  }
};

/**
 * Servicio para obtener datos de clasificación.
 * Permite listar temporadas y obtener la tabla de posiciones.
 */
export const ClasificacionService = {
  getTemporadas: async () => {
    const res = await api.get('/clasificacion/temporadas');
    return res.data;
  },
  getClasificacion: async (temporada, categoria) => {
    const res = await api.get(`/clasificacion?temporada=${temporada}&categoria=${categoria}`);
    return res.data;
  }
};

/**
 * Servicio para gestionar equipos.
 * Permite crear, eliminar y actualizar equipos, así como subir sus logos.
 */
export const EquipoService = {
  crear: async (data) => {
    const res = await api.post('/equipos', data);
    return res.data;
  },
  eliminar: async (id, temporada, categoria) => {
    const res = await api.delete(`/equipos/${id}?temporada=${temporada}&categoria=${categoria}`);
    return res.data;
  },
  actualizarEntrenador: async (id, entrenador) => {
    const res = await api.put(`/equipos/${id}`, { entrenador });
    return res.data;
  },
  subirLogo: async (id, formData) => {
    const res = await api.put(`/equipos/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

/**
 * Servicio para gestionar jugadores.
 * Proporciona métodos para obtener jugadores, MVPs, crear, editar, eliminar y actualizar sus estadísticas.
 */
export const JugadorService = {
  getByEquipo: async (equipoId, temporada, categoria) => {
    const url = temporada && categoria 
      ? `/jugadores/equipo/${equipoId}?temporada=${temporada}&categoria=${categoria}`
      : `/jugadores/equipo/${equipoId}`;
    const res = await api.get(url);
    return res.data;
  },
  getMvp: async (temporada, categoria) => {
    const res = await api.get(`/jugadores/mvp?temporada=${temporada}&categoria=${categoria}`);
    return res.data;
  },
  crear: async (data) => {
    const res = await api.post('/jugadores', data);
    return res.data;
  },
  actualizar: async (id, data) => {
    const res = await api.put(`/jugadores/${id}`, data);
    return res.data;
  },
  sumarPuntos: async (id, data) => {
    const res = await api.put(`/jugadores/${id}/puntos`, data);
    return res.data;
  },
  eliminar: async (id) => {
    const res = await api.delete(`/jugadores/${id}`);
    return res.data;
  },
  subirFoto: async (id, formData) => {
    const res = await api.put(`/jugadores/${id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

/**
 * Servicio para la gestión de partidos.
 * Incluye funciones para obtener el fixture, registrar resultados, crear y eliminar partidos.
 */
export const PartidoService = {
  getPartidos: async (temporada, categoria) => {
    const res = await api.get(`/partidos?temporada=${temporada}&categoria=${categoria}`);
    return res.data;
  },
  crear: async (data) => {
    const res = await api.post('/partidos', data);
    return res.data;
  },
  siguienteTemporada: async (temporadaOriginal, nuevaTemporada, categoria) => {
    const res = await api.post('/partidos/siguiente-temporada', {
      temporada: temporadaOriginal, siguienteTemporada: nuevaTemporada, categoria
    });
    return res.data;
  },
  actualizar: async (id, data) => {
    const res = await api.put(`/partidos/${id}`, data);
    return res.data;
  },
  eliminar: async (id, temporada, categoria) => {
    const res = await api.delete(`/partidos/${id}?temporada=${temporada}&categoria=${categoria}`);
    return res.data;
  },
  eliminarTemporada: async (temporada, categoria) => {
    const res = await api.delete(`/partidos/temporada?temporada=${temporada}&categoria=${categoria}`);
    return res.data;
  },
  enviarResultado: async (id, data) => {
    const res = await api.put('/partidos/resultado', { id, ...data });
    return res.data;
  }
};