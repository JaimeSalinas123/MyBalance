// backend/database.ts
import { Pool } from 'pg';

// Configuramos la conexión a Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido por Render para conexiones seguras
  }
});

// Función para inicializar las tablas
const initDB = async () => {
  try {
    // Tabla de usuarios (En Postgres usamos SERIAL para autoincrementar)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    console.log("Tabla 'usuarios' lista y configurada en PostgreSQL.");

    // Tabla de transacciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usuarios(id),
        tipo VARCHAR(50) NOT NULL,
        concepto VARCHAR(255) NOT NULL,
        monto DECIMAL(10, 2) NOT NULL,
        fecha VARCHAR(50) NOT NULL
      )
    `);
    console.log("Tabla 'transacciones' lista y configurada en PostgreSQL.");
  } catch (error) {
    console.error("Error al inicializar PostgreSQL:", error);
  }
};

initDB();

export default pool;