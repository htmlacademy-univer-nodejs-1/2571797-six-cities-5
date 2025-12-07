import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { AuthService } from '../../services/auth.service.js';
import { UnauthorizedException } from '../../exceptions/app.exception.js';

type RequestWithUser = Request & { userId?: string };

export class AuthMiddleware implements Middleware {
  constructor(private readonly authService: AuthService) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const requestWithUser = req as RequestWithUser;

    if (requestWithUser.userId) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = authHeader.substring(7);
    const user = await this.authService.getUserByToken(token);

    if (!user) {
      throw new UnauthorizedException();
    }

    requestWithUser.userId = user._id.toString();
    next();
  }
}
