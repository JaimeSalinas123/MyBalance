// src/lib/axios.ts

import axios from 'axios';

//Creamos una instancia base
//Le decimos que todas las peticiones iran automaticamente a backend local

const api = axios.create({
    baseURL: 'https://tu-backend-en-render.onrender.com/api',
});

//El interceptor (Mnesaje Automatico)
//Esta funcion intercepta cada peticion justo antes de que salga hacia el servidor
api.interceptors.request.use(
    (config) => {
        //Verificamos que estamos en el navegador (next.js tambien corre en el servidor, donde localstorage no existe)
        if (typeof window !== 'undefined') {
            //Buscamos la llave digital en el almacenamiento del navegador
            const token = localStorage.getItem('token');

            if (token) {
                //Si la encontramos, la pegamos en la cabecera de la peticion
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