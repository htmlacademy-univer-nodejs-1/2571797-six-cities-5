import { Request, Response, Router } from 'express';
import { injectable, inject } from 'inversify';
import asyncHandler from 'express-async-handler';
import { Controller } from '../../core/controller/controller.abstract.js';
import { AuthService } from '../../services/auth.service.js';
import { CreateUserDto } from '../../dto/create-user.dto.js';
import { LoginUserDto } from '../../dto/login-user.dto.js';
import { transformUserToResponse } from '../../utils/response-transformers.js';
import { LoginResponse } from '../../types/response.types.js';
import { UnauthorizedException } from '../../exceptions/app.exception.js';
import { ValidateDtoMiddleware } from '../../core/middleware/validate-dto.middleware.js';

@injectable()
export class AuthController extends Controller {
  protected authService: AuthService;
  private readonly validateCreateUserDtoMiddleware: ValidateDtoMiddleware;
  private readonly validateLoginUserDtoMiddleware: ValidateDtoMiddleware;

  constructor(
    @inject('AuthService') authService: AuthService
  ) {
    super();
    this.authService = authService;
    this.validateCreateUserDtoMiddleware = new ValidateDtoMiddleware(CreateUserDto);
    this.validateLoginUserDtoMiddleware = new ValidateDtoMiddleware(LoginUserDto);
  }

  public getRouter(): Router {
    const router = Router();

    router.post(
      '/register',
      asyncHandler(this.validateCreateUserDtoMiddleware.execute.bind(this.validateCreateUserDtoMiddleware)),
      asyncHandler(this.register.bind(this))
    );
    router.post(
      '/login',
      asyncHandler(this.validateLoginUserDtoMiddleware.execute.bind(this.validateLoginUserDtoMiddleware)),
      asyncHandler(this.login.bind(this))
    );
    router.get('/check', asyncHandler(this.check.bind(this)));

    return router;
  }

  private async register(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateUserDto;
    const user = await this.authService.register(dto);
    const userResponse = transformUserToResponse(user);
    this.created(res, userResponse);
  }

  private async login(req: Request, res: Response): Promise<void> {
    const dto = req.body as LoginUserDto;
    const authResult = await this.authService.login(dto);

    const loginResponse: LoginResponse = {
      token: authResult.token
    };

    this.ok(res, loginResponse);
  }

  private async check(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = authHeader.substring(7);
    const user = await this.authService.checkAuth(token);

    if (!user) {
      throw new UnauthorizedException();
    }

    const userResponse = transformUserToResponse(user);
    this.ok(res, userResponse);
  }
}

