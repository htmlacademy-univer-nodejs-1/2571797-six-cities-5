import { prop, getModelForClass, DocumentType, modelOptions, Ref } from '@typegoose/typegoose';
import { UserEntity } from './user.model.js';
import { OfferEntity } from './offer.model.js';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'comments'
  }
})
export class CommentEntity {
  @prop({
    required: true,
    minlength: 5,
    maxlength: 1024,
    trim: true
  })
  public text!: string;

  @prop({
    required: true,
    default: Date.now
  })
  public postDate!: Date;

  @prop({
    required: true,
    min: 1,
    max: 5,
    set: (val: number) => Math.round(val * 10) / 10
  })
  public rating!: number;

  @prop({
    required: true,
    ref: () => UserEntity
  })
  public author!: Ref<UserEntity>;

  @prop({
    required: true,
    ref: () => OfferEntity
  })
  public offer!: Ref<OfferEntity>;
}

export const CommentModel = getModelForClass(CommentEntity);
export type CommentDocument = DocumentType<CommentEntity>;

