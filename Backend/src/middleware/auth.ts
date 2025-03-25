import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { db } from '../config/db';

export const requireAuth = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ['HS256']
});

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).auth;
      
      const { data: userData, error } = await db
        .from('users')
        .select('role')
        .eq('id', user.sub)
        .single();

      if (error || !userData) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      if (!roles.includes(userData.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};