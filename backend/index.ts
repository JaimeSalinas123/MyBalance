// backend/index.ts

// TS: Además de express, importamos los tipos 'Request' y 'Response' como documentación
import express, { Request, Response } from 'express';
import { verificarToken, AuthRequest } from './middlewares/auth.js';

import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// TS: NOTA CLAVE. Aunque el archivo físico sea database.ts, en la configuración NodeNext de TypeScript
// las importaciones siempre deben llevar la extensión .js.
import db from './database.js';

const app = express();
const PORT: number = 3000; //TS: Definamos explicitamente que el puerto es un numero 

//TS: Definimos una constante de configuracion. En produccion esto deberia ir en un archivo .ENV
const JWT_SECRET: string = 'tu_palabra_secreta_super_segura_123';

app.use(cors());
app.use(express.json());

//DOCUMENTACION DE INTERFACES (contratos de tipado)
// Las interfaces le dicen a TypeScript exactamente qué campos debe traer el cuerpo (body) de la petición HTTP.
//TS: Definamos una Interfaz, Es como un contraro que dice exactamente que datos y que tipo vamos a recibir desde react para guardar
interface TransaccionBody {
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
}

interface RegisterBody {
  nombre: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

//endpoint de registro(POST)
// TS: req se tipa especificando que el Body debe cumplir estrictamente con RegisterBody
app.post('/api/auth/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { nombre, email, password } = req.body;

  try {
    // Encriptamos la contraseña con un factor de costo de 10 (Salt)
    const saltRounds: number = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`;

    db.run(query, [nombre, email, hashedPassword], function(this: import('sqlite3').RunResult, err: Error | null) {
      if (err) {
        // SQLite devuelve un error específico si el email ya existe debido a la restricción UNIQUE
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

//endpoint de login (POST)
// TS: Forzamos a que el cuerpo de la petición traiga únicamente email y password
app.post('/api/auth/login', (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM usuarios WHERE email = ?`;

  // TS: tipamos 'row' como 'any' porque la estructura proviene directamente de la base de datos de forma dinámica
  db.get(query, [email], async (err: Error | null, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Credenciales incorrectas (Usuario no encontrado).' });

    // Verificamos si la contraseña coincide con el hash guardado
    const match: boolean = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: 'Credenciales incorrectas (Contraseña inválida).' });

    // Si todo coincide, firmamos el token JWT incluyendo el ID y el email del usuario
    const token: string = jwt.sign(
      { id: row.id, email: row.email },
      JWT_SECRET,
      { expiresIn: '24h' } // El token expira automáticamente en un día
    );

    // Devolvemos el token y los datos públicos del usuario para que React los use
    res.json({
      token,
      usuario: {
        id: row.id,
        nombre: row.nombre,
        email: row.email
      }
    });
  });
});

//Guardar nuevas transacciones
// TS: Cambiamos Request por AuthRequest para poder usar req.user. Añadimos el middleware verificarToken.
app.post('/api/transacciones', verificarToken, (req: AuthRequest, res: Response) => {
  const { tipo, concepto, monto, fecha } = req.body;
  
  // Extraemos el id real del usuario desde el token desencriptado
  const user_id = req.user.id; 

  const query = `INSERT INTO transacciones (user_id, tipo, concepto, monto, fecha) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [user_id, tipo, concepto, monto, fecha], function(this: import('sqlite3').RunResult, err: Error | null) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, mensaje: 'Guardado exitosamente' });
  });
});

//Obtener todas las transacciones (GET)
// TS: Agregamos verificarToken y cambiamos Request a AuthRequest
app.get('/api/transacciones', verificarToken, (req: AuthRequest, res: Response) => {
  const user_id = req.user.id;
  
  // Filtramos en la base de datos para que el usuario solo vea sus propios registros
  const query = `SELECT * FROM transacciones WHERE user_id = ? ORDER BY id DESC`;
  
  db.all(query, [user_id], (err: Error | null, rows: any[]) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

//Eliminar transacciones DELETE
// TS: Agregamos verificarToken y cambiamos Request a AuthRequest
app.delete('/api/transacciones/:id', verificarToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params; 
  const user_id = req.user.id;
  
  // Validamos que el ID del registro exista Y que pertenezca al usuario logueado
  const query = `DELETE FROM transacciones WHERE id = ? AND user_id = ?`;

  db.run(query, [id, user_id], function(this: import('sqlite3').RunResult, err: Error | null) {
    if (err) return res.status(500).json({ error: err.message });
    
    // this.changes verifica si realmente se borró alguna fila en SQLite
    if (this.changes === 0) return res.status(404).json({ error: 'Registro no encontrado o no autorizado' });
    
    res.json({ mensaje: 'Transacción eliminada correctamente' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

