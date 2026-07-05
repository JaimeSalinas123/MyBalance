// backend/database.js
import sqlite3 from 'sqlite3';

// 1. Conectamos o creamos el archivo físico de la base de datos
const db = new sqlite3.Database('./mybalance.db', (err) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

// 2. Creamos la tabla de transacciones si es que no existe todavía
db.serialize(() => {
  const queryTabla = `
    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      concepto TEXT NOT NULL,
      monto REAL NOT NULL,
      fecha TEXT NOT NULL
    )
  `;

  db.run(queryTabla, (err) => {
    if (err) {
      console.error("Error al crear la tabla:", err.message);
    } else {
      console.log("Tabla 'transacciones' lista y configurada.");
    }
  });
});

// Exportamos la conexión para poder usarla en nuestro servidor Express después
export default db;