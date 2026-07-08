// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://mybalance-u58l.onrender.com/api',
});

// Interceptor de Peticiones (Envía el token)
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuestas (Maneja el error 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Atrapamos tanto el 401 como el 403
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (typeof window !== 'undefined') {
                // Borramos el token fantasma
                localStorage.removeItem('token');
                // Redirigimos forzosamente al login para obtener uno nuevo y fresco
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;