import { UserDocument, UserEntity } from '../models/user.model.js';
import { OfferDocument, OfferEntity } from '../models/offer.model.js';
import { CommentDocument, CommentEntity } from '../models/comment.model.js';

export interface DatabaseService<TDocument, TEntity> {
  findById(id: string): Promise<TDocument | null>;
  create(data: Partial<TEntity>): Promise<TDocument>;
  findAll(limit?: number): Promise<TDocument[]>;
  update(id: string, data: Partial<TEntity>): Promise<TDocument | null>;
  delete(id: string): Promise<boolean>;
}

export interface UserDatabaseService extends DatabaseService<UserDocument, UserEntity> {
  findByEmail(email: string): Promise<UserDocument | null>;
}

export interface OfferDatabaseService extends DatabaseService<OfferDocument, OfferEntity> {
  findByCity(city: string, limit?: number): Promise<OfferDocument[]>;
  findPremiumByCity(city: string, limit?: number): Promise<OfferDocument[]>;
}

export interface CommentDatabaseService extends DatabaseService<CommentDocument, CommentEntity> {
  findByOfferId(offerId: string, limit?: number): Promise<CommentDocument[]>;
}

