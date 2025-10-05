export interface MockOfferData {
  title: string;
  description: string;
  city: string;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  rating: number;
  housingType: string;
  rooms: number;
  guests: number;
  price: number;
  comforts: string[];
  latitude: number;
  longitude: number;
}

export interface MockServerResponse {
  offers: MockOfferData[];
}

export interface GeneratedOffer {
  title: string;
  description: string;
  date: string;
  city: string;
  previewImage: string;
  images: string;
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: string;
  rooms: number;
  guests: number;
  price: number;
  comforts: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  password: string;
  userType: string;
  latitude: number;
  longitude: number;
}
