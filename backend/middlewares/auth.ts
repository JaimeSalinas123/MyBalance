import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'tu_palabra_secreta_super_segura_123';

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  const authHeader = req.headers['authorization'];
  
  // --- INICIO MODO DEPURACIÓN ---
  console.log("=== NUEVA PETICIÓN RECIBIDA ===");
  console.log("Cabecera Authorization recibida:", authHeader);
  // --- FIN MODO DEPURACIÓN ---

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("Resultado: Token NO encontrado después del split.");
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    console.log("Resultado: Token verificado con éxito para el usuario:", decoded.email);
    next(); 
  } catch (error: any) {
    console.log("Resultado: Falló la verificación del token. Error:", error.message);
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};