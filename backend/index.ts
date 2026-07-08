// backend/index.ts
import express, { Request, Response } from 'express';
import { verificarToken, AuthRequest } from './middlewares/auth.js';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './database.js';

const app = express();
const PORT = process.env.PORT || 3000; 

// Configuración reforzada de CORS
app.use(cors({
  origin: ['https://mybalance-xi.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET: string = process.env.JWT_SECRET || 'tu_palabra_secreta_super_segura_123';

// --- RUTAS ---

// Registro
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { nombre, email, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // En Postgres usamos $1, $2... y RETURNING para obtener el ID recién creado
    const query = `INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id`;
    const result = await pool.query(query, [nombre, email, hashedPassword]);
    
    res.status(201).json({ id: result.rows[0].id, mensaje: 'Usuario registrado con éxito.' });
  } catch (error: any) {
    // Código 23505 es el error de duplicado (UNIQUE) en PostgreSQL
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }
    res.status(500).json({ error: 'Error interno al procesar el registro.' });
  }
});

// Login (Soporta Email o Nombre)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const query = `SELECT * FROM usuarios WHERE email = $1 OR nombre = $2`;
    const result = await pool.query(query, [email, email]);
    const row = result.rows[0];

    if (!row) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      usuario: { id: row.id, nombre: row.nombre, email: row.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Transacciones
app.post('/api/transacciones', verificarToken, async (req: AuthRequest, res: Response) => {
  const { tipo, concepto, monto, fecha } = req.body;
  const user_id = req.user.id; 
  try {
    const query = `INSERT INTO transacciones (user_id, tipo, concepto, monto, fecha) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const result = await pool.query(query, [user_id, tipo, concepto, monto, fecha]);
    res.json({ id: result.rows[0].id, mensaje: 'Guardado exitosamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transacciones', verificarToken, async (req: AuthRequest, res: Response) => {
  const user_id = req.user.id;
  try {
    const query = `SELECT * FROM transacciones WHERE user_id = $1 ORDER BY id DESC`;
    const result = await pool.query(query, [user_id]);
    
    // SOLUCIÓN: Convertimos el 'monto' de Texto a Número para que React y .toFixed() no fallen
    const transaccionesFormateadas = result.rows.map(row => ({
      ...row,
      monto: parseFloat(row.monto)
    }));

    res.json(transaccionesFormateadas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/transacciones/:id', verificarToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params; 
  const user_id = req.user.id;
  try {
    const query = `DELETE FROM transacciones WHERE id = $1 AND user_id = $2`;
    const result = await pool.query(query, [id, user_id]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: 'No autorizado' });
    res.json({ mensaje: 'Transacción eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});