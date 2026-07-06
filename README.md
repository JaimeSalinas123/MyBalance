# 📊 MyBalance

¡Bienvenido a **MyBalance**! Esta herramienta es una solución digital diseñada para tomar el control absoluto de tus finanzas personales de una forma rápida, clara y completamente estructurada.

Desarrollado como un gestor de gastos de uso personal, MyBalance te permite registrar y monitorear tus movimientos económicos sin las complicaciones ni los riesgos de las plataformas financieras automatizadas. **No requiere ni incluye conexiones con cuentas bancarias reales**, garantizando así la máxima privacidad y control de tus datos.

---

## 🚀 ¿Qué se construyó y cómo funciona?

El objetivo de este proyecto fue diseñar, desarrollar y desplegar una aplicación **Full-Stack** completa, aplicando buenas prácticas de arquitectura web y seguridad. 

* **Backend (API REST):** Construido con **Node.js** y **Express**, gestiona de forma segura la lógica de negocio. Implementa autenticación basada en **JSON Web Tokens (JWT)** y encriptación de contraseñas con `bcrypt` para proteger los accesos.
* **Base de Datos Relacional:** Se integró **SQLite** para gestionar de forma eficiente y persistente los usuarios y su historial de registros, manteniendo la ligereza del sistema.
* **Frontend Reactivo:** Desarrollado del lado del cliente con **Next.js** y **React**. La interfaz de usuario fue diseñada con **Tailwind CSS** para asegurar una experiencia limpia, moderna y adaptable a cualquier dispositivo.
* **Despliegue en la Nube (Arquitectura Desacoplada):** El sistema vive en un entorno de producción real. El Frontend está alojado en **Vercel** para aprovechar su alta velocidad de entrega, mientras que el Backend funciona como un servicio web independiente en **Render**. Ambos entornos se comunican de forma segura mediante políticas estrictas de **CORS**.

---

## ✨ Características principales

* **Control Manual y Privado:** Registra cada ingreso y gasto manualmente. Tu información es 100% tuya y no se sincroniza con entidades externas.
* **Interfaz Estilo Excel:** Visualiza tu flujo de dinero en tablas limpias y organizadas que facilitan la lectura rápida de tu historial.
* **Autenticación Segura:** Sistema de login y registro para que cada usuario tenga acceso exclusivo a su propio libro de cuentas digital.
* **Dashboard Financiero:** Un panel visual e intuitivo que calcula automáticamente tus saldos netos y te ofrece un resumen en tiempo real y automatico de tu salud financiera.

---

## 🛠️ Tecnologías utilizadas

<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=ts,nextjs,react,nodejs,express,sqlite,tailwind,vercel" alt="Tech Stack" />
  </a>
</p>

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Axios.
* **Backend:** Node.js, Express, TypeScript, SQLite, JWT (JSON Web Tokens).
* **Infraestructura y Despliegue:** Vercel (Client-side) y Render (Server-side).

---

> **Nota del Desarrollador:** Este proyecto demuestra la capacidad de construir una arquitectura cliente-servidor desde cero, superando retos técnicos como la gestión de persistencia de datos en contenedores efímeros y la configuración de seguridad entre dominios en la nube.
