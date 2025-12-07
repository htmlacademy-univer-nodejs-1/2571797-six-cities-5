import type {OfferDocument} from '../models/offer.model.js';
import {OfferEntity, OfferModel} from '../models/offer.model.js';
import {FavoriteDatabaseService, OfferDatabaseService} from '../interfaces/database.interface.js';
import {CommentModel} from '../models/comment.model.js';
import {DatabaseException, NotFoundException} from '../exceptions/app.exception.js';
import {inject, injectable} from 'inversify';

const PREMIUM_OFFERS_LIMIT = 3;
const RATING_ROUNDING_FACTOR = 10;

@injectable()
export class OfferService implements OfferDatabaseService {
  constructor(
    @inject('FavoriteService') private readonly favoriteService: FavoriteDatabaseService
  ) {}

  public async findById(id: string): Promise<OfferDocument | null> {
    try {
      const result = await OfferModel.findById(id)
        .populate('author')
        .exec();
      return result as OfferDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find offer by id');
    }
  }

  public async create(data: Partial<OfferEntity>): Promise<OfferDocument> {
    try {
      const offer = new OfferModel(data);
      const savedOffer = await offer.save();
      return savedOffer as OfferDocument;
    } catch (error) {
      throw new DatabaseException('Failed to create offer');
    }
  }

  public async findAll(limit?: number): Promise<OfferDocument[]> {
    try {
      let query = OfferModel.find().populate('author').sort({ postDate: -1 });

      if (limit) {
        query = query.limit(limit);
      }

      const result = await query.exec();
      return result as OfferDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find offers');
    }
  }

  public async update(id: string, data: Partial<OfferEntity>): Promise<OfferDocument | null> {
    try {
      const result = await OfferModel.findByIdAndUpdate(id, data, { new: true })
        .populate('author')
        .exec();
      return result as OfferDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to update offer');
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await CommentModel.deleteMany({ offer: id }).exec();

      const result = await OfferModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw new DatabaseException('Failed to delete offer');
    }
  }

  public async findByCity(city: string, limit?: number): Promise<OfferDocument[]> {
    try {
      let query = OfferModel.find({ city }).populate('author').sort({ postDate: -1 });

      if (limit) {
        query = query.limit(limit);
      }

      const result = await query.exec();
      return result as OfferDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find offers by city');
    }
  }

  public async findPremiumByCity(city: string, limit = PREMIUM_OFFERS_LIMIT): Promise<OfferDocument[]> {
    try {
      const result = await OfferModel.find({ city, isPremium: true })
        .populate('author')
        .sort({ postDate: -1 })
        .limit(limit)
        .exec();
      return result as OfferDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find premium offers by city');
    }
  }

  public async updateCommentsCount(offerId: string): Promise<void> {
    try {
      const commentsCount = await CommentModel.countDocuments({ offer: offerId });
      await OfferModel.findByIdAndUpdate(offerId, { commentsCount });
    } catch (error) {
      // Игнорируем ошибки обновления количества комментариев
    }
  }

  public async updateRating(offerId: string): Promise<void> {
    try {
      const comments = await CommentModel.find({ offer: offerId }).select('rating').exec();
      if (comments.length === 0) {
        await OfferModel.findByIdAndUpdate(offerId, { rating: 0 });
        return;
      }

      const totalRating = comments.reduce((sum: number, comment) => sum + comment.rating, 0);
      const averageRating = totalRating / comments.length;
      const roundedRating = Math.round(averageRating * RATING_ROUNDING_FACTOR) / RATING_ROUNDING_FACTOR;

      await OfferModel.findByIdAndUpdate(offerId, { rating: roundedRating });
    } catch (error) {
      // Игнорируем ошибки обновления рейтинга
    }
  }

  public async getFavoriteOfferIds(userId: string): Promise<string[]> {
    return await this.favoriteService.getFavoriteOfferIds(userId);
  }

  public async findFavoritesByUserId(userId: string): Promise<OfferDocument[]> {
    try {
      const favoriteOfferIds = await this.getFavoriteOfferIds(userId);
      if (favoriteOfferIds.length === 0) {
        return [];
      }

      const result = await OfferModel.find({ _id: { $in: favoriteOfferIds } })
        .populate('author')
        .sort({ postDate: -1 })
        .exec();
      return result as OfferDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find favorite offers by user id');
    }
  }

  public async addToFavorites(userId: string, offerId: string): Promise<boolean> {
    try {
      const offer = await OfferModel.findById(offerId);
      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      const favorite = await this.favoriteService.addToFavorites(userId, offerId);
      return !!favorite;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException('Failed to add offer to favorites');
    }
  }

  public async removeFromFavorites(userId: string, offerId: string): Promise<boolean> {
    return await this.favoriteService.removeFromFavorites(userId, offerId);
  }

  public async isFavorite(userId: string | undefined, offerId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    try {
      const favorite = await this.favoriteService.findByUserAndOffer(userId, offerId);
      return !!favorite;
    } catch (error) {
      return false;
    }
  }

  public async findAllWithFavorites(userId?: string, limit?: number): Promise<OfferDocument[]> {
    try {
      let query = OfferModel.find().populate('author').sort({ postDate: -1 });

      if (limit) {
        query = query.limit(limit);
      }

      const offers = await query.exec();
      const result = offers as OfferDocument[];

      if (userId) {
        const favoriteOfferIds = await this.getFavoriteOfferIds(userId);
        result.forEach((offer) => {
          (offer as OfferDocument & { isFavorite: boolean }).isFavorite = favoriteOfferIds.includes(offer._id.toString());
        });
      }

      return result;
    } catch (error) {
      throw new DatabaseException('Failed to find offers with favorites');
    }
  }

  public async findByIdWithFavorites(id: string, userId?: string): Promise<OfferDocument | null> {
    try {
      const offer = await OfferModel.findById(id)
        .populate('author')
        .exec();

      if (!offer) {
        return null;
      }

      const result = offer as OfferDocument;

      if (userId) {
        (result as OfferDocument & { isFavorite: boolean }).isFavorite = await this.isFavorite(userId, id);
      }

      return result;
    } catch (error) {
      throw new DatabaseException('Failed to find offer by id with favorites');
    }
  }

  public async findPremiumByCityWithFavorites(city: string, userId?: string, limit = PREMIUM_OFFERS_LIMIT): Promise<OfferDocument[]> {
    try {
      const offers = await OfferModel.find({ city, isPremium: true })
        .populate('author')
        .sort({ postDate: -1 })
        .limit(limit)
        .exec();

      const result = offers as OfferDocument[];

      if (userId) {
        const favoriteOfferIds = await this.getFavoriteOfferIds(userId);
        result.forEach((offer) => {
          (offer as OfferDocument & { isFavorite: boolean }).isFavorite = favoriteOfferIds.includes(offer._id.toString());
        });
      }

      return result;
    } catch (error) {
      throw new DatabaseException('Failed to find premium offers by city with favorites');
    }
  }
}

