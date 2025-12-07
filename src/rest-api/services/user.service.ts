import { UserModel, UserEntity } from '../models/user.model.js';
import type { UserDocument } from '../models/user.model.js';
import { UserDatabaseService } from '../interfaces/database.interface.js';
import { DatabaseException } from '../exceptions/app.exception.js';
import bcrypt from 'bcrypt';
import { injectable, inject } from 'inversify';

interface Config {
  get(key: string): string | number | object;
}

@injectable()
export class UserService implements UserDatabaseService {
  private readonly salt: string;
  private readonly saltRounds = 10;

  constructor(
    @inject('Config') private readonly config: Config
  ) {
    this.salt = (this.config.get('salt') as string) || '';
  }

  public async findById(id: string): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findById(id).exec();
      return result as UserDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find user by id');
    }
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findOne({ email }).exec();
      return result as UserDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find user by email');
    }
  }

  public async create(data: Partial<UserEntity>): Promise<UserDocument> {
    try {
      const user = new UserModel(data);
      const savedUser = await user.save();
      return savedUser as unknown as UserDocument;
    } catch (error) {
      throw new DatabaseException('Failed to create user');
    }
  }

  public async findAll(limit?: number): Promise<UserDocument[]> {
    try {
      let query = UserModel.find();
      if (limit) {
        query = query.limit(limit);
      }
      const result = await query.exec();
      return result as unknown as UserDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find users');
    }
  }

  public async update(id: string, data: Partial<UserEntity>): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
      return result as UserDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to update user');
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw new DatabaseException('Failed to delete user');
    }
  }

  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(`${password}${this.salt}`, this.saltRounds);
  }

  public async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(`${password}${this.salt}`, hashedPassword);
  }

  public async createWithHashedPassword(userData: Partial<UserEntity>): Promise<UserDocument> {
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }
    return await this.create(userData);
  }

  public async updateWithHashedPassword(id: string, userData: Partial<UserEntity>): Promise<UserDocument | null> {
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }
    return await this.update(id, userData);
  }

  public async existsByEmail(email: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ email }).select('_id').exec();
      return !!user;
    } catch (error) {
      throw new DatabaseException('Failed to check if user exists by email');
    }
  }

  public async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findOne({ email }).select('+password').exec();
      return result as UserDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find user by email with password');
    }
  }
}

