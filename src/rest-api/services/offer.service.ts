import { OfferModel, OfferEntity } from '../models/offer.model.js';
import type { OfferDocument } from '../models/offer.model.js';
import { OfferDatabaseService } from '../interfaces/database.interface.js';

export class OfferService implements OfferDatabaseService {
  public async findById(id: string): Promise<OfferDocument | null> {
    try {
      const result = await (OfferModel as any).findById(id)
        .populate('author')
        .exec();
      return result;
    } catch (error) {
      return null;
    }
  }

  public async create(data: Partial<OfferEntity>): Promise<OfferDocument> {
    const offer = new OfferModel(data);
    const savedOffer = await offer.save();
    return savedOffer as any;
  }

  public async findAll(limit?: number): Promise<OfferDocument[]> {
    try {
      let query = (OfferModel as any).find().populate('author').sort({ postDate: -1 });

      if (limit) {
        query = query.limit(limit);
      }

      const result = await query.exec();
      return result;
    } catch (error) {
      return [];
    }
  }

  public async update(id: string, data: Partial<OfferEntity>): Promise<OfferDocument | null> {
    try {
      const result = await (OfferModel as any).findByIdAndUpdate(id, data, { new: true })
        .populate('author')
        .exec();
      return result;
    } catch (error) {
      return null;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await OfferModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      return false;
    }
  }

  public async findByCity(city: string, limit?: number): Promise<OfferDocument[]> {
    try {
      let query = (OfferModel as any).find({ city }).populate('author').sort({ postDate: -1 });

      if (limit) {
        query = query.limit(limit);
      }

      const result = await query.exec();
      return result;
    } catch (error) {
      return [];
    }
  }

  public async findPremiumByCity(city: string, limit = 3): Promise<OfferDocument[]> {
    try {
      const result = await (OfferModel as any).find({ city, isPremium: true })
        .populate('author')
        .sort({ postDate: -1 })
        .limit(limit)
        .exec();
      return result;
    } catch (error) {
      return [];
    }
  }
}

