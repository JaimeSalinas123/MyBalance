// backend/index.ts
import express, { Request, Response } from 'express';
import { verificarToken, AuthRequest } from './middlewares/auth.js';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database.js';

const app = express();

// 1. Puerto dinámico para Render
const PORT = process.env.PORT || 3000; 

// 2. Configuración de CORS para seguridad
// Reemplaza la URL de abajo por la de tu Vercel cuando la tengas
const corsOptions = {
  origin: ['https://tu-frontend-en-vercel.vercel.app', 'http://localhost:3000'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const JWT_SECRET: string = process.env.JWT_SECRET || 'tu_palabra_secreta_super_segura_123';

// --- RUTAS ---

// Registro
app.post('/api/auth/register', async (req: Request<{}, {}, any>, res: Response) => {
  const { nombre, email, password } = req.body;
  try {
    const saltRounds: number = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`;

    db.run(query, [nombre, email, hashedPassword], function(this: any, err: Error | null) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, mensaje: 'Usuario registrado con éxito.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al procesar el registro.' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM usuarios WHERE email = ?`;

  db.get(query, [email], async (err: Error | null, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const match: boolean = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const token: string = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      usuario: { id: row.id, nombre: row.nombre, email: row.email }
    });
  });
});

// Transacciones
app.post('/api/transacciones', verificarToken, (req: AuthRequest, res: Response) => {
  const { tipo, concepto, monto, fecha } = req.body;
  const user_id = req.user.id; 
  const query = `INSERT INTO transacciones (user_id, tipo, concepto, monto, fecha) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [user_id, tipo, concepto, monto, fecha], function(this: any, err: Error | null) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, mensaje: 'Guardado exitosamente' });
  });
});

app.get('/api/transacciones', verificarToken, (req: AuthRequest, res: Response) => {
  const user_id = req.user.id;
  const query = `SELECT * FROM transacciones WHERE user_id = ? ORDER BY id DESC`;
  
  db.all(query, [user_id], (err: Error | null, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/transacciones/:id', verificarToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params; 
  const user_id = req.user.id;
  const query = `DELETE FROM transacciones WHERE id = ? AND user_id = ?`;

  db.run(query, [id, user_id], function(this: any, err: Error | null) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'No autorizado' });
    res.json({ mensaje: 'Transacción eliminada' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});