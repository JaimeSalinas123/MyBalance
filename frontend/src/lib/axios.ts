// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    // ¡AQUÍ ESTÁ LA MAGIA! Agregamos /api al final
    baseURL: 'https://mybalance-u58l.onrender.com/api',
});

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

export default api;