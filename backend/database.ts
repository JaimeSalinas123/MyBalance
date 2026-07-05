// backend/database.ts

//importacion de sqlite, los tipos que ya instalamos con @types/sqlite3
import sqlite3 from 'sqlite3';

//TS:  Declaramos que db es de tipo sqlite3 database 
//Esto habilitara el autocompletado para los metodos de db en vs code
// TS: 'err: Error | null' significa que la variable 'err' puede ser un objeto de Error o nulo si todo sale bien.

const db: sqlite3.Database = new sqlite3.Database('./mybalance.db', (err: Error | null) => {
  if (err) {
    console.error("Error al conectar con SQLite:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

db.serialize(() => {
  //creacion de la tabla de usuarios
  const queryUsuarios: string = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `;

  // TS: Volvemos a tipar 'err' como 'Error | null' por seguridad
  db.run(queryUsuarios, (err: Error | null) => {
    if (err) {
      console.error("Error al crear la tabla usuarios:", err.message);
    } else {
      console.log("Tabla 'usuarios' lista y configurada.");
    }
  });

//Creacion de la tabala de transacciones (Estilo Excel, sin logicas bancarias complejas)
const queryTabla: string = `
    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      tipo TEXT NOT NULL,
      concepto TEXT NOT NULL,
      monto REAL NOT NULL,
      fecha TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES usuarios(id)
    )
  `;

  db.run(queryTabla, (err: Error | null) => {
    if (err) {
      console.error("Error al crear la tabla transacciones:", err.message);
    } else {
      console.log("Tabla 'transacciones' lista y configurada.");
    }
  });
});

export default db;