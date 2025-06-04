import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';

interface JwtPayload {
  id: string;
  role: string;
  name: string;
}

export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    if (!process.env.JWT_SECRET) {
      // Use the same default secret as in auth.ts
      process.env.JWT_SECRET = 'trichygold-dev-temporary-secret-key';
      console.warn('Auth middleware: Using default JWT_SECRET - this is not secure for production');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
}; 