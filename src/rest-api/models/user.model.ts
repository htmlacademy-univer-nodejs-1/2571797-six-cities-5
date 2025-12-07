import { prop, getModelForClass, DocumentType, modelOptions } from '@typegoose/typegoose';
import { UserType } from '../../shared/types/user-type.enum.js';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'users'
  }
})
export class UserEntity {
  @prop({
    required: true,
    minlength: 1,
    maxlength: 15,
    trim: true
  })
  public name!: string;

  @prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  })
  public email!: string;

  @prop({
    default: '/img/avatar.svg',
    trim: true
  })
  public avatar?: string;

  @prop({
    required: true,
    select: false
  })
  public password!: string;

  @prop({
    required: true,
    enum: UserType,
    default: UserType.Normal
  })
  public type!: UserType;
}

export const UserModel = getModelForClass(UserEntity);
export type UserDocument = DocumentType<UserEntity>;

