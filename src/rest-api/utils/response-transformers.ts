import { UserDocument } from '../models/user.model.js';
import { OfferDocument } from '../models/offer.model.js';
import { UserResponse, OfferListItemResponse, OfferResponse, LocationResponse } from '../types/response.types.js';

export function transformUserToResponse(user: UserDocument): UserResponse {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    type: user.type
  };
}

export function transformLocationToResponse(location: { latitude: number; longitude: number }): LocationResponse {
  return {
    latitude: location.latitude,
    longitude: location.longitude
  };
}

export function transformOfferToListItem(offer: OfferDocument, isFavorite = false): OfferListItemResponse {
  return {
    id: offer._id.toString(),
    title: offer.title,
    postDate: offer.postDate.toISOString(),
    city: offer.city,
    previewImage: offer.previewImage,
    isPremium: offer.isPremium,
    rating: offer.rating,
    housingType: offer.housingType,
    price: offer.price,
    commentsCount: offer.commentsCount || 0,
    isFavorite
  };
}

export function transformOfferToResponse(offer: OfferDocument, isFavorite = false): OfferResponse {
  const author = offer.author as UserDocument;

  return {
    ...transformOfferToListItem(offer, isFavorite),
    description: offer.description,
    images: offer.images,
    rooms: offer.rooms,
    maxGuests: offer.maxGuests,
    comforts: offer.comforts,
    author: transformUserToResponse(author),
    location: transformLocationToResponse(offer.location)
  };
}

