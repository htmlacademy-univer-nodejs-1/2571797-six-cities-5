import { prop, getModelForClass, DocumentType, modelOptions, Ref } from '@typegoose/typegoose';
import { City } from '../../shared/types/city.enum.js';
import { HousingType } from '../../shared/types/housing-type.enum.js';
import { ComfortType } from '../../shared/types/comfort-type.enum.js';
import { UserEntity } from './user.model.js';

export class LocationEntity {
  @prop({ required: true })
  public latitude!: number;

  @prop({ required: true })
  public longitude!: number;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'offers'
  }
})
export class OfferEntity {
  @prop({
    required: true,
    minlength: 10,
    maxlength: 100,
    trim: true
  })
  public title!: string;

  @prop({
    required: true,
    minlength: 20,
    maxlength: 1024,
    trim: true
  })
  public description!: string;

  @prop({
    required: true,
    default: Date.now
  })
  public postDate!: Date;

  @prop({
    required: true,
    enum: City
  })
  public city!: City;

  @prop({
    required: true,
    trim: true
  })
  public previewImage!: string;

  @prop({
    required: true,
    type: [String],
    validate: {
      validator: (images: string[]) => images.length === 6,
      message: 'Images array must contain exactly 6 images'
    }
  })
  public images!: string[];

  @prop({
    required: true,
    default: false
  })
  public isPremium!: boolean;

  @prop({
    required: true,
    min: 1,
    max: 5,
    set: (val: number) => Math.round(val * 10) / 10
  })
  public rating!: number;

  @prop({
    required: true,
    enum: HousingType
  })
  public housingType!: HousingType;

  @prop({
    required: true,
    min: 1,
    max: 8
  })
  public rooms!: number;

  @prop({
    required: true,
    min: 1,
    max: 10
  })
  public maxGuests!: number;

  @prop({
    required: true,
    min: 100,
    max: 100000
  })
  public price!: number;

  @prop({
    required: true,
    type: [String],
    enum: ComfortType
  })
  public comforts!: ComfortType[];

  @prop({
    required: true,
    ref: () => UserEntity
  })
  public author!: Ref<UserEntity>;

  @prop({
    default: 0,
    min: 0
  })
  public commentsCount!: number;

  @prop({
    required: true,
    type: LocationEntity
  })
  public location!: LocationEntity;
}

export const OfferModel = getModelForClass(OfferEntity);
export type OfferDocument = DocumentType<OfferEntity>;

