import { CommentModel, CommentEntity } from '../models/comment.model.js';
import type { CommentDocument } from '../models/comment.model.js';
import { CommentDatabaseService } from '../interfaces/database.interface.js';

export class CommentService implements CommentDatabaseService {
  public async findById(id: string): Promise<CommentDocument | null> {
    try {
      const query = (CommentModel as any).findById(id).populate('author').populate('offer');
      const result = await query.exec();
      return result as CommentDocument | null;
    } catch (error) {
      return null;
    }
  }

  public async create(data: Partial<CommentEntity>): Promise<CommentDocument> {
    const comment = new CommentModel(data);
    const savedComment = await comment.save();
    return savedComment as any;
  }

  public async findAll(limit?: number): Promise<CommentDocument[]> {
    try {
      const query = (CommentModel as any).find().populate('author').populate('offer').sort({ postDate: -1 });
      if (limit) {
        query.limit(limit);
      }
      const result = await query.exec();
      return result as CommentDocument[];
    } catch (error) {
      return [];
    }
  }

  public async update(id: string, data: Partial<CommentEntity>): Promise<CommentDocument | null> {
    try {
      const query = (CommentModel as any).findByIdAndUpdate(id, data, { new: true }).populate('author').populate('offer');
      const result = await query.exec();
      return result as CommentDocument | null;
    } catch (error) {
      return null;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await CommentModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      return false;
    }
  }

  public async findByOfferId(offerId: string, limit = 50): Promise<CommentDocument[]> {
    try {
      const query = (CommentModel as any).find({ offer: offerId })
        .populate('author')
        .sort({ postDate: -1 })
        .limit(limit);
      const result = await query.exec();
      return result as CommentDocument[];
    } catch (error) {
      return [];
    }
  }
}

