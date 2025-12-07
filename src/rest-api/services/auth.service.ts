import { UserDocument } from '../models/user.model.js';
import { UserType } from '../../shared/types/user-type.enum.js';
import { UserDatabaseService } from '../interfaces/database.interface.js';
import {
  UnauthorizedException,
  ConflictException,
  DatabaseException
} from '../exceptions/app.exception.js';
import jwt from 'jsonwebtoken';
import { injectable, inject } from 'inversify';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: UserDocument;
  token: string;
}

interface Config {
  get(key: string): string | number | object;
}

@injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    @inject('UserService') private readonly userService: UserDatabaseService,
    @inject('Config') private readonly config: Config
  ) {
    const jwtConfig = this.config.get('jwt') as { secret: string; expiresIn: string };
    this.jwtSecret = jwtConfig.secret;
    this.jwtExpiresIn = jwtConfig.expiresIn;
  }

  public async register(userData: {
    name: string;
    email: string;
    password: string;
    type?: UserType;
    avatar?: string;
  }): Promise<UserDocument> {
    try {
      const existingUser = await this.userService.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const newUser = await this.userService.createWithHashedPassword({
        ...userData,
        type: userData.type || UserType.Normal,
      });

      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new DatabaseException('Failed to register user');
    }
  }

  public async login(loginData: LoginData): Promise<AuthResult> {
    try {
      const { email, password } = loginData;

      const user = await this.userService.findByEmailWithPassword(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await this.userService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
      );

      return {
        user,
        token
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new DatabaseException('Failed to authenticate user');
    }
  }

  public async verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  public async getUserByToken(token: string): Promise<UserDocument | null> {
    try {
      const decoded = await this.verifyToken(token);
      if (!decoded) {
        return null;
      }

      const user = await this.userService.findById(decoded.userId);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  public async checkAuth(token: string): Promise<UserDocument | null> {
    try {
      return await this.getUserByToken(token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
