import 'express';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
        name: string;
      };
    }
  }
}

interface User {
  id: string;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

export type { User }; 