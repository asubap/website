import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET as string;

export interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  sub: string; // user ID
  role?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

export const verifySupabaseToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET) as SupabaseJwtPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
