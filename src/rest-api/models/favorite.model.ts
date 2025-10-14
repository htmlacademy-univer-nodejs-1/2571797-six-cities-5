import { prop, getModelForClass, DocumentType, modelOptions, Ref } from '@typegoose/typegoose';
import { UserEntity } from './user.model.js';
import { OfferEntity } from './offer.model.js';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'favorites'
  }
})
export class FavoriteEntity {
  @prop({
    required: true,
    ref: () => UserEntity
  })
  public user!: Ref<UserEntity>;

  @prop({
    required: true,
    ref: () => OfferEntity
  })
  public offer!: Ref<OfferEntity>;
}

export const FavoriteModel = getModelForClass(FavoriteEntity);
export type FavoriteDocument = DocumentType<FavoriteEntity>;
