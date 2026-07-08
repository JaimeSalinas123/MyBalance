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
        // Si el backend nos rechaza por falta de permisos, limpiamos la sesión
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Si quieres que recargue la página o envíe al login automáticamente, descomenta esto:
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;