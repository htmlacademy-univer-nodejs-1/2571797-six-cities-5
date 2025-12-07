export type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: 'normal' | 'pro';
};

export type ApiLocation = {
  latitude: number;
  longitude: number;
};

export type ApiOfferListItem = {
  id: string;
  title: string;
  postDate: string;
  city: string;
  previewImage: string;
  isPremium: boolean;
  rating: number;
  housingType: string;
  price: number;
  commentsCount: number;
  isFavorite: boolean;
};

export type ApiOffer = ApiOfferListItem & {
  description: string;
  images: string[];
  rooms: number;
  maxGuests: number;
  comforts: string[];
  author: ApiUser;
  location: ApiLocation;
};

export type ApiComment = {
  id: string;
  text: string;
  postDate: string;
  rating: number;
  author: ApiUser;
};

export type LoginResponse = {
  token: string;
};

