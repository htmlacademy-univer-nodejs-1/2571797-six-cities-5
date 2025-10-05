import { MockOfferData, GeneratedOffer } from '../../types/mock-data.type.js';
import { City } from '../../types/city.enum.js';
import { HousingType } from '../../types/housing-type.enum.js';
import { ComfortType } from '../../types/comfort-type.enum.js';

export class DataGenerator {
  private readonly cities = Object.values(City);
  private readonly housingTypes = Object.values(HousingType);
  private readonly comforts = Object.values(ComfortType);

  public generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generateRandomFloat(min: number, max: number, decimals = 1): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  public getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  public generateRandomDate(): string {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString();
  }

  public generateRandomComforts(): string[] {
    const count = this.generateRandomNumber(1, this.comforts.length);
    const shuffled = [...this.comforts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count) as string[];
  }

  public generateOfferFromMock(mockData: MockOfferData, authorName: string, authorEmail: string, authorAvatar: string, password: string, userType: string): GeneratedOffer {
    const city = this.getRandomElement(this.cities) as string;
    const housingType = this.getRandomElement(this.housingTypes) as string;
    const rooms = this.generateRandomNumber(1, 8);
    const guests = this.generateRandomNumber(1, 10);
    const price = this.generateRandomNumber(100, 100000);
    const rating = this.generateRandomFloat(1, 5);
    const isPremium = Math.random() < 0.3;
    const isFavorite = Math.random() < 0.2;

    const cityCoordinates = this.getCityCoordinates(city);

    return {
      title: mockData.title,
      description: mockData.description,
      date: this.generateRandomDate(),
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
