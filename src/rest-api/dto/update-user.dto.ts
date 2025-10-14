import { UserType } from '../../shared/types/user-type.enum.js';
import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(15, { message: 'Name must not exceed 15 characters' })
  public name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  public email?: string;

  @IsOptional()
  @IsString()
  public avatar?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(12, { message: 'Password must not exceed 12 characters' })
  public password?: string;

  @IsOptional()
  @IsEnum(UserType, { message: 'Type must be either normal or pro' })
  public type?: UserType;
}
