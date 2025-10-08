import { FavoriteModel, FavoriteEntity } from '../models/favorite.model.js';
import type { FavoriteDocument } from '../models/favorite.model.js';
import { FavoriteDatabaseService } from '../interfaces/database.interface.js';
import { DatabaseException } from '../exceptions/app.exception.js';
import { injectable } from 'inversify';

@injectable()
export class FavoriteService implements FavoriteDatabaseService {
  public async findById(id: string): Promise<FavoriteDocument | null> {
    try {
      const result = await FavoriteModel.findById(id)
        .populate('user')
        .populate('offer')
        .exec();
      return result as FavoriteDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find favorite by id');
    }
  }

  public async create(data: Partial<FavoriteEntity>): Promise<FavoriteDocument> {
    try {
      const favorite = new FavoriteModel(data);
      const savedFavorite = await favorite.save();
      return savedFavorite as FavoriteDocument;
    } catch (error) {
      throw new DatabaseException('Failed to create favorite');
    }
  }

  public async findAll(limit?: number): Promise<FavoriteDocument[]> {
    try {
      let query = FavoriteModel.find().populate('user').populate('offer');
      if (limit) {
        query = query.limit(limit);
      }
      const result = await query.exec();
      return result as FavoriteDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find favorites');
    }
  }

  public async update(id: string, data: Partial<FavoriteEntity>): Promise<FavoriteDocument | null> {
    try {
      const result = await FavoriteModel.findByIdAndUpdate(id, data, { new: true })
        .populate('user')
        .populate('offer')
        .exec();
      return result as FavoriteDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to update favorite');
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await FavoriteModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw new DatabaseException('Failed to delete favorite');
    }
  }

  public async findByUserId(userId: string): Promise<FavoriteDocument[]> {
    try {
      const result = await FavoriteModel.find({ user: userId })
        .populate('user')
        .populate('offer')
        .exec();
      return result as FavoriteDocument[];
    } catch (error) {
      throw new DatabaseException('Failed to find favorites by user id');
    }
  }

  public async findByUserAndOffer(userId: string, offerId: string): Promise<FavoriteDocument | null> {
    try {
      const result = await FavoriteModel.findOne({ user: userId, offer: offerId })
        .populate('user')
        .populate('offer')
        .exec();
      return result as FavoriteDocument | null;
    } catch (error) {
      throw new DatabaseException('Failed to find favorite by user and offer');
    }
  }

  public async deleteByUserAndOffer(userId: string, offerId: string): Promise<boolean> {
    try {
      const result = await FavoriteModel.findOneAndDelete({ user: userId, offer: offerId }).exec();
      return !!result;
    } catch (error) {
      throw new DatabaseException('Failed to delete favorite by user and offer');
    }
  }

  public async addToFavorites(userId: string, offerId: string): Promise<FavoriteDocument | null> {
    try {
      const existing = await this.findByUserAndOffer(userId, offerId);
      if (existing) {
        return existing;
      }

      const favorite = new FavoriteModel({ user: userId, offer: offerId });
      const savedFavorite = await favorite.save();
      return savedFavorite as FavoriteDocument;
    } catch (error) {
      throw new DatabaseException('Failed to add to favorites');
    }
  }

  public async removeFromFavorites(userId: string, offerId: string): Promise<boolean> {
    return await this.deleteByUserAndOffer(userId, offerId);
  }

  public async getFavoriteOfferIds(userId: string): Promise<string[]> {
    try {
      const favorites = await FavoriteModel.find({ user: userId }).select('offer').exec();
      return favorites.map((fav) => fav.offer.toString());
    } catch (error) {
      throw new DatabaseException('Failed to get favorite offer ids');
    }
  }
}
