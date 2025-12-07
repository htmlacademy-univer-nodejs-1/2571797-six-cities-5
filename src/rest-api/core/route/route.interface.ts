import { Router } from 'express';
import { Middleware } from '../middleware/middleware.interface.js';

export interface Route {
  path: string;
  router: Router;
  middlewares?: Middleware[];
}

