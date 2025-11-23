import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export type UserRole = 'ADMIN' | 'USER';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    next();
  };
};

export const authorizeSelfOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  if (req.user.role === 'ADMIN' || req.user.id === req.params.id) {
    return next();
  }

  return res.status(403).json({ error: 'Acesso não autorizado' });
};
