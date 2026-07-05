// backend/index.js
import express from 'express';
import cors from 'cors';
import db from './database.js'; 

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());

// ── 1. Guardar una nueva transacción (POST) ──
app.post('/api/transacciones', (req, res) => {
  const { tipo, concepto, monto, fecha } = req.body;
  const query = `INSERT INTO transacciones (tipo, concepto, monto, fecha) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [tipo, concepto, monto, fecha], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, mensaje: 'Guardado exitosamente' });
  });
});

// ── 2. Obtener todas las transacciones (GET) ──
app.get('/api/transacciones', (req, res) => {
  const query = `SELECT * FROM transacciones ORDER BY id DESC`;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ── 3. NUEVO: Eliminar una transacción (DELETE) ──
app.delete('/api/transacciones/:id', (req, res) => {
  const { id } = req.params; // Capturamos el ID que nos envía React
  const query = `DELETE FROM transacciones WHERE id = ?`;

  db.run(query, id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Transacción eliminada correctamente' });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});