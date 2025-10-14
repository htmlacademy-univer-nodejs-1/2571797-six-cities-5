import { UserModel, UserEntity } from '../models/user.model.js';
import type { UserDocument } from '../models/user.model.js';
import { UserDatabaseService } from '../interfaces/database.interface.js';

export class UserService implements UserDatabaseService {
  public async findById(id: string): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findById(id).exec();
      return result as UserDocument | null;
    } catch (error) {
      return null;
    }
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findOne({ email }).exec();
      return result as UserDocument | null;
    } catch (error) {
      return null;
    }
  }

  public async create(data: Partial<UserEntity>): Promise<UserDocument> {
    const user = new UserModel(data);
    const savedUser = await user.save();
    return savedUser as any;
  }

  public async findAll(limit?: number): Promise<UserDocument[]> {
    try {
      let query = UserModel.find();
      if (limit) {
        query = query.limit(limit);
      }
      const result = await query.exec();
      return result as any;
    } catch (error) {
      return [];
    }
  }

  public async update(id: string, data: Partial<UserEntity>): Promise<UserDocument | null> {
    try {
      const result = await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
      return result as UserDocument | null;
    } catch (error) {
      return null;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      return false;
    }
  }
}

