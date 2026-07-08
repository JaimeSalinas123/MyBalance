// backend/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'tu_palabra_secreta_super_segura_123';

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  // 1. Obtenemos la cabecera de autorización enviada por Axios
  const authHeader = req.headers['authorization'];
  
  // 2. Extraemos SOLO el token, separándolo de la palabra "Bearer"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // 3. Verificamos la firma del token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario en la petición
    next(); // Dejamos pasar la petición hacia las transacciones
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};