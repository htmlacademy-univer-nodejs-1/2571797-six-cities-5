import {FileReader} from './file-reader.interface.js';
import {readFileSync} from 'node:fs';
import {Offer, User, City, HousingType, Location, ComfortType} from '../../types';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) {
  }

  public read(): void {
    this.rawData = readFileSync(this.filename, {encoding: 'utf-8'});
  }

  public toArray(): Offer[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => line.split('\t'))
      .map(([title, description, createdDate, city, previewImage, images, isPremium, isFavorite, rating, housingType, rooms, maxGuests, price, comforts, authorName, authorEmail, authorAvatar, password, userType, latitude, longitude]) => ({
        title,
        description,
        postDate: new Date(createdDate),
        city: city as City,
        previewImage,
        images: images.split(';'),
        isPremium: isPremium === 'true',
        isFavorite: isFavorite === 'true',
        rating: parseFloat(rating),
        housingType: housingType as unknown as HousingType,
        rooms: parseInt(rooms, 10),
        maxGuests: parseInt(maxGuests, 10),
        price: parseInt(price, 10),
        comforts: comforts.split(';').map((comfort) => comfort as unknown as ComfortType),
        author: {name: authorName, email: authorEmail, avatar: authorAvatar, password, userType} as unknown as User,
        commentsCount: 228,
        location: {latitude: parseFloat(latitude), longitude: parseFloat(longitude)} as unknown as Location,
      }));
  }
}
