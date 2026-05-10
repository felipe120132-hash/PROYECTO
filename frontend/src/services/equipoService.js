import axios from 'axios';

const API_URL = 'http://localhost:3000/api/equipos';

// Configuramos el token para todas las peticiones que lo necesiten
const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const equipoService = {
    // Obtener equipos (Público)
    getAll: async () => {
        const res = await axios.get(API_URL);
        return res.data;
    },
    // Crear equipo (Privado - Requiere Token)
    create: async (equipo) => {
        const res = await axios.post(API_URL, equipo, getAuthHeader());
        return res.data;
    },
    // Eliminar equipo (Privado - Requiere Token)
    delete: async (id) => {
        const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return res.data;
    }
};