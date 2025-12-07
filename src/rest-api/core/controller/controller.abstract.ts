import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../../services/auth.service.js';
import { UnauthorizedException } from '../../exceptions/app.exception.js';

export abstract class Controller {
  protected authService?: AuthService;

  protected send<T>(res: Response, statusCode: number, data: T): void {
    res.status(statusCode).json(data);
  }

  protected ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  protected created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }

  protected async getUserIdFromRequest(req: Request, required = false): Promise<string | undefined> {
    if (!this.authService) {
      throw new Error('AuthService is not initialized in controller');
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        throw new UnauthorizedException();
      }
      return undefined;
    }

    const token = authHeader.substring(7);
    const user = await this.authService.getUserByToken(token);

    if (!user) {
      if (required) {
        throw new UnauthorizedException();
      }
      return undefined;
    }

    return user._id.toString();
  }
}

