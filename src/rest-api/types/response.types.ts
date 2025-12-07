import { UserType } from '../../shared/types/user-type.enum.js';
import { City } from '../../shared/types/city.enum.js';
import { HousingType } from '../../shared/types/housing-type.enum.js';
import { ComfortType } from '../../shared/types/comfort-type.enum.js';

export interface LocationResponse {
  latitude: number;
  longitude: number;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: UserType;
}

export interface LoginResponse {
  token: string;
}

export interface OfferListItemResponse {
  id: string;
  title: string;
  postDate: string;
  city: City;
  previewImage: string;
  isPremium: boolean;
  rating: number;
  housingType: HousingType;
  price: number;
  commentsCount: number;
  isFavorite: boolean;
}

export interface OfferResponse extends OfferListItemResponse {
  description: string;
  images: string[];
  rooms: number;
  maxGuests: number;
  comforts: ComfortType[];
  author: UserResponse;
  location: LocationResponse;
}

