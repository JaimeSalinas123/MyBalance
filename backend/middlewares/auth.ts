// backend/middlewares/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = 'tu_palabra_secreta_super_segura_123';

//TS: Por defecto Express no sabe que request puede traer un usuario, asi que agregamos una nueva interfaz
//que hereda request, pero le agregamos 'user';

export interface AuthRequest extends Request {
    user?: any; //aca guardamos el id u email de usuario logueado
}

// Este es el middleware que intercepta la ruta
export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Los tokens suelen enviarse en los headers bajo la llave 'Authorization'
  const authHeader = req.headers['authorization'];
  
  // El formato estándar es "Bearer el_chorizo_del_token". Lo separamos para agarrar solo el token.
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

// verificamos si el token fue firmado con nuestra palabra secreta 
jwt.verify(token, JWT_SECRET, (err, decodeUser) => {
    if (err) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    //si es valido inyectamos los datos del usuarios en la peticion (req)
    req.user = decodeUser;

 // next() le dice a Express: "Todo bien, déjalo pasar a la ruta que quería ir"
    next();
  });
};