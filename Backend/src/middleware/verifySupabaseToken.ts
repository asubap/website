import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET as string;

export interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  sub: string;
  role?: string;
  email?: string;
  // other properties from the token
}

export const verifySupabaseToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET) as SupabaseJwtPayload;
    // Attach payload to request for later use (e.g., role-based checks)
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
