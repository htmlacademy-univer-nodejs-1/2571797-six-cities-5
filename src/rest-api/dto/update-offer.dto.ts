import { City } from '../../shared/types/city.enum.js';
import { HousingType } from '../../shared/types/housing-type.enum.js';
import { ComfortType } from '../../shared/types/comfort-type.enum.js';
import { LocationDto } from './location.dto.js';
import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  public title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(1024, { message: 'Description must not exceed 1024 characters' })
  public description?: string;

  @IsOptional()
  @IsEnum(City, { message: 'City must be one of the supported cities' })
  public city?: City;

  @IsOptional()
  @IsUrl({}, { message: 'Preview image must be a valid URL' })
  public previewImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(6, { message: 'Images array must contain exactly 6 images' })
  @ArrayMaxSize(6, { message: 'Images array must contain exactly 6 images' })
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  public images?: string[];

  @IsOptional()
  @IsBoolean()
  public isPremium?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Rating must be a number with at most 1 decimal place' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  public rating?: number;

  @IsOptional()
  @IsEnum(HousingType, { message: 'Housing type must be one of: apartment, house, room, hotel' })
  public housingType?: HousingType;

  @IsOptional()
  @IsNumber({}, { message: 'Rooms must be a number' })
  @Min(1, { message: 'Rooms must be at least 1' })
  @Max(8, { message: 'Rooms must not exceed 8' })
  public rooms?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Max guests must be a number' })
  @Min(1, { message: 'Max guests must be at least 1' })
  @Max(10, { message: 'Max guests must not exceed 10' })
  public maxGuests?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(100, { message: 'Price must be at least 100' })
  @Max(100000, { message: 'Price must not exceed 100000' })
  public price?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(ComfortType, { each: true, message: 'Each comfort must be one of the supported types' })
  public comforts?: ComfortType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  public location?: LocationDto;
}
