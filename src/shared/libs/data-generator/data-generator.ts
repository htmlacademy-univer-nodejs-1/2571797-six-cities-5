import { MockOfferData, GeneratedOffer } from '../../types/mock-data.type.js';
import { City, HousingType, ComfortType } from '../../types';

const DEFAULT_DECIMALS = 1;
const START_YEAR = 2020;
const START_MONTH = 0;
const START_DAY = 1;
const RANDOM_SORT_THRESHOLD = 0.5;

const enum OfferLimits {
  MinRooms = 1,
  MaxRooms = 8,
  MinGuests = 1,
  MaxGuests = 10,
  MinPrice = 100,
  MaxPrice = 100000,
  MinRating = 1,
  MaxRating = 5
}

const enum Probability {
  Premium = 0.3,
  Favorite = 0.2
}

export class DataGenerator {
  private readonly cities = Object.values(City);
  private readonly housingTypes = Object.values(HousingType);
  private readonly comforts = Object.values(ComfortType);

  public static generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static generateRandomFloat(min: number, max: number, decimals = DEFAULT_DECIMALS): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  public static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  public static generateRandomDate(): string {
    const start = new Date(START_YEAR, START_MONTH, START_DAY);
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString();
  }

  public generateRandomComforts(): string[] {
    const count = DataGenerator.generateRandomNumber(1, this.comforts.length);
    const shuffledComforts = [...this.comforts].sort(() => RANDOM_SORT_THRESHOLD - Math.random());
    return shuffledComforts.slice(0, count) as string[];
  }

  public generateOfferFromMock(mockData: MockOfferData, authorName: string, authorEmail: string, authorAvatar: string, password: string, userType: string): GeneratedOffer {
    const city = DataGenerator.getRandomElement(this.cities) as string;
    const housingType = DataGenerator.getRandomElement(this.housingTypes) as string;
    const rooms = DataGenerator.generateRandomNumber(OfferLimits.MinRooms, OfferLimits.MaxRooms);
    const guests = DataGenerator.generateRandomNumber(OfferLimits.MinGuests, OfferLimits.MaxGuests);
    const price = DataGenerator.generateRandomNumber(OfferLimits.MinPrice, OfferLimits.MaxPrice);
    const rating = DataGenerator.generateRandomFloat(OfferLimits.MinRating, OfferLimits.MaxRating);
    const isPremium = Math.random() < Probability.Premium;
    const isFavorite = Math.random() < Probability.Favorite;

    const cityCoordinates = this.getCityCoordinates(city);

    return {
      title: mockData.title,
      description: mockData.description,
      date: DataGenerator.generateRandomDate(),
      city,
      previewImage: mockData.previewImage,
      images: mockData.images.join(';'),
      isPremium,
      isFavorite,
      rating,
      housingType,
      rooms,
      guests,
      price,
      comforts: this.generateRandomComforts().join(';'),
      authorName,
      authorEmail,
      authorAvatar,
      password,
      userType,
      latitude: cityCoordinates.latitude,
      longitude: cityCoordinates.longitude
    };
  }

  private getCityCoordinates(city: string): { latitude: number; longitude: number } {
    const coordinates: Record<string, { latitude: number; longitude: number }> = {
      [City.Paris]: { latitude: 48.85661, longitude: 2.351499 },
      [City.Cologne]: { latitude: 50.938361, longitude: 6.959974 },
      [City.Brussels]: { latitude: 50.846557, longitude: 4.351697 },
      [City.Amsterdam]: { latitude: 52.370216, longitude: 4.895168 },
      [City.Hamburg]: { latitude: 53.550341, longitude: 10.000654 },
      [City.Dusseldorf]: { latitude: 51.225402, longitude: 6.776314 }
    };

    return coordinates[city];
  }
}
