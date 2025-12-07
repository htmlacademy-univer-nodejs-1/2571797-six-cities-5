import { CityLocation } from '../const';
import { ApiComment, ApiOffer, ApiOfferListItem, ApiUser } from '../types/api';
import { CityName, Comment, Offer, Type, User } from '../types/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';
const API_HOST = new URL(API_BASE_URL).origin;

const toAbsoluteUrl = (url?: string): string => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_HOST}${url}`;
  }

  return `${API_HOST}/${url}`;
};

const resolveCityName = (city: string): CityName => {
  const found = (Object.keys(CityLocation) as CityName[]).find(
    (name) => name.toLowerCase() === city.toLowerCase()
  );

  return found ?? (Object.keys(CityLocation)[0] as CityName);
};

export const mapApiUser = (user: ApiUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: toAbsoluteUrl(user.avatar),
  isPro: user.type === 'pro',
});

type OfferSource = ApiOffer | ApiOfferListItem;

export const mapApiOffer = (offer: OfferSource): Offer => {
  const cityName = resolveCityName(offer.city);

  return {
    id: offer.id,
    postDate: offer.postDate,
    price: offer.price,
    rating: offer.rating,
    title: offer.title,
    isPremium: offer.isPremium,
    isFavorite: offer.isFavorite,
    city: {
      name: cityName,
      location: CityLocation[cityName],
    },
    location: 'location' in offer ? offer.location : CityLocation[cityName],
    previewImage: toAbsoluteUrl(offer.previewImage),
    type: offer.housingType as Type,
    bedrooms: 'rooms' in offer ? offer.rooms : 1,
    description: 'description' in offer ? offer.description : '',
    goods: 'comforts' in offer ? offer.comforts : [],
    host: 'author' in offer ? mapApiUser(offer.author) : {
      id: undefined,
      name: '',
      email: '',
      avatarUrl: '',
      isPro: false,
    },
    images: 'images' in offer ? offer.images.map(toAbsoluteUrl) : [toAbsoluteUrl(offer.previewImage)],
    maxAdults: 'maxGuests' in offer ? offer.maxGuests : 1,
    commentsCount: offer.commentsCount,
  };
};

export const mapApiComment = (comment: ApiComment): Comment => ({
  id: comment.id,
  comment: comment.text,
  date: comment.postDate,
  rating: comment.rating,
  user: mapApiUser(comment.author),
});
