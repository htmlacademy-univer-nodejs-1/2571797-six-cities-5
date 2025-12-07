import type {CommentDocument} from '../models/comment.model.js';
import {CommentEntity, CommentModel} from '../models/comment.model.js';
import {CommentDatabaseService, OfferDatabaseService} from '../interfaces/database.interface.js';
import {DatabaseException} from '../exceptions/app.exception.js';
import {inject, injectable} from 'inversify';

const DEFAULT_COMMENTS_LIMIT = 50;
const RATING_ROUNDING_FACTOR = 10;

@injectable()
export class CommentService implements CommentDatabaseService {
  constructor(
    @inject('OfferService') private readonly offerService: OfferDatabaseService
  ) {}

  public async findById(id: string): Promise<CommentDocument | null> {
    try {
      const result = await CommentModel.findById(id)
        .populate('author')
        .populate('offer')
        .exec();
      return result as CommentDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find comment by id');
    }
  }

  public async create(data: Partial<CommentEntity>): Promise<CommentDocument> {
    try {
      const comment = new CommentModel(data);
      const savedComment = await comment.save();

      if (savedComment.offer) {
        await this.updateOfferStats(savedComment.offer.toString());
      }

      return savedComment;
    } catch (error) {
      throw new DatabaseException('Failed to create comment');
    }
  }

  public async findAll(limit?: number): Promise<CommentDocument[]> {
    try {
      let query = CommentModel.find()
        .populate('author')
        .populate('offer')
        .sort({ postDate: -1 });

      if (limit) {
        query = query.limit(limit);
      }

      return await query.exec();
    } catch (error) {
      throw new DatabaseException('Failed to find comments');
    }
  }

  public async update(id: string, data: Partial<CommentEntity>): Promise<CommentDocument | null> {
    try {
      const result = await CommentModel.findByIdAndUpdate(id, data, { new: true })
        .populate('author')
        .populate('offer')
        .exec();
      return result as CommentDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to update comment');
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const comment = await CommentModel.findById(id).select('offer').exec();
      if (!comment) {
        return false;
      }

      const result = await CommentModel.findByIdAndDelete(id).exec();

      if (result && comment.offer) {
        await this.updateOfferStats(comment.offer.toString());
      }

      return !!result;
    } catch (error) {
      throw new DatabaseException('Failed to delete comment');
    }
  }

  public async findByOfferId(offerId: string, limit = DEFAULT_COMMENTS_LIMIT): Promise<CommentDocument[]> {
    try {
      return await CommentModel.find({offer: offerId})
        .populate('author')
        .sort({postDate: -1})
        .limit(limit)
        .exec();
    } catch (error) {
      throw new DatabaseException('Failed to find comments by offer id');
    }
  }

  private async updateOfferStats(offerId: string): Promise<void> {
    try {
      await this.offerService.updateCommentsCount(offerId);
      await this.offerService.updateRating(offerId);
    } catch (error) {
      // Игнорируем ошибки обновления статистики
    }
  }

  public async getAverageRating(offerId: string): Promise<number> {
    try {
      const comments = await CommentModel.find({ offer: offerId }).select('rating').exec();
      if (comments.length === 0) {
        return 0;
      }

      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
      const averageRating = totalRating / comments.length;

      return Math.round(averageRating * RATING_ROUNDING_FACTOR) / RATING_ROUNDING_FACTOR;
    } catch (error) {
      throw new DatabaseException('Failed to get average rating');
    }
  }

  public async getCommentsCount(offerId: string): Promise<number> {
    try {
      return await CommentModel.countDocuments({ offer: offerId });
    } catch (error) {
      throw new DatabaseException('Failed to get comments count');
    }
  }
}

