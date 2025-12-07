import { Request, Response, Router } from 'express';
import { promises as fs } from 'node:fs';
import { injectable, inject } from 'inversify';
import asyncHandler from 'express-async-handler';
import { Controller } from '../../core/controller/controller.abstract.js';
import { AuthService } from '../../services/auth.service.js';
import { UserDatabaseService } from '../../interfaces/database.interface.js';
import { CreateUserDto } from '../../dto/create-user.dto.js';
import { LoginUserDto } from '../../dto/login-user.dto.js';
import { transformUserToResponse } from '../../utils/response-transformers.js';
import { LoginResponse } from '../../types/response.types.js';
import { UnauthorizedException, BadRequestException, NotFoundException } from '../../exceptions/app.exception.js';
import { ValidateDtoMiddleware } from '../../core/middleware/validate-dto.middleware.js';
import { UploadFileMiddleware } from '../../core/middleware/upload-file.middleware.js';
import type { ParamsDictionary } from 'express-serve-static-core';

interface Config {
  get(key: string): string | number | object;
}

type RequestWithFile = Request<ParamsDictionary> & { file?: Express.Multer.File };

@injectable()
export class AuthController extends Controller {
  protected authService: AuthService;
  private readonly validateCreateUserDtoMiddleware: ValidateDtoMiddleware;
  private readonly validateLoginUserDtoMiddleware: ValidateDtoMiddleware;
  private readonly uploadAvatarMiddleware: UploadFileMiddleware;

  constructor(
    @inject('AuthService') authService: AuthService,
    @inject('UserService') private readonly userService: UserDatabaseService,
    @inject('Config') private readonly config: Config
  ) {
    super();
    this.authService = authService;
    this.validateCreateUserDtoMiddleware = new ValidateDtoMiddleware(CreateUserDto);
    this.validateLoginUserDtoMiddleware = new ValidateDtoMiddleware(LoginUserDto);
    this.uploadAvatarMiddleware = new UploadFileMiddleware(
      this.config.get('uploadDirectory') as string,
      'avatar'
    );
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
    router.post(
      '/avatar',
      this.uploadAvatarMiddleware.execute.bind(this.uploadAvatarMiddleware),
      asyncHandler(this.uploadAvatar.bind(this))
    );

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

  private async uploadAvatar(req: Request, res: Response): Promise<void> {
    const requestWithFile = req as RequestWithFile;
    const userId = await this.ensureAuthorizedUser(req);
    const avatarPath = res.locals.uploadedFilePath as string | undefined;

    if (!avatarPath) {
      await this.removeUploadedFile(requestWithFile.file);
      throw new BadRequestException('Avatar file is required');
    }

    const updatedUser = await this.userService.update(userId, { avatar: avatarPath });

    if (!updatedUser) {
      await this.removeUploadedFile(requestWithFile.file);
      throw new NotFoundException('User not found');
    }

    const userResponse = transformUserToResponse(updatedUser);
    this.ok(res, userResponse);
  }

  private async ensureAuthorizedUser(req: Request): Promise<string> {
    const requestWithFile = req as RequestWithFile;
    try {
      const userId = await this.getUserIdFromRequest(req, true);

      if (!userId) {
        throw new UnauthorizedException();
      }

      return userId;
    } catch (error) {
      await this.removeUploadedFile(requestWithFile.file);
      throw error;
    }
  }

  private async removeUploadedFile(file?: Express.Multer.File): Promise<void> {
    if (file?.path) {
      try {
        await fs.unlink(file.path);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

