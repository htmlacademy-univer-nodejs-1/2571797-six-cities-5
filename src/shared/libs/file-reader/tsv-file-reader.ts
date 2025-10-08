import {FileReader} from './file-reader.interface.js';
import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';
import {Offer, User, City, HousingType, Location, ComfortType} from '../../types/index.js';

export class TSVFileReader implements FileReader {
  constructor(
    private readonly filename: string
  ) {}

  public async readOffers(): Promise<Offer[]> {
    const offers: Offer[] = [];
    const fileStream = createReadStream(this.filename, { encoding: 'utf-8' });
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineNumber = 0;
    for await (const line of rl) {
      lineNumber++;

      if (line.trim().length === 0) {
        continue;
      }

      if (lineNumber === 1 && line.includes('title\tdescription')) {
        continue;
      }

      try {
        const offer = this.parseLine(line, lineNumber);
        offers.push(offer);
      } catch (error) {
        console.warn(`Warning: Failed to parse line ${lineNumber}: ${error}`);
        continue;
      }
    }

    return offers;
  }

  private parseLine(line: string, _lineNumber: number): Offer {
    const fields = line.split('\t');

    if (fields.length < 21) {
      throw new Error(`Invalid TSV format: expected 21 fields, got ${fields.length}`);
    }

    const [
      title, description, createdDate, city, previewImage, images,
      isPremium, isFavorite, rating, housingType, rooms, maxGuests,
      price, comforts, authorName, authorEmail, authorAvatar,
      password, type, latitude, longitude
    ] = fields;

    return {
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
      author: {
        name: authorName,
        email: authorEmail,
        avatar: authorAvatar,
        password,
        type
      } as unknown as User,
      commentsCount: 0,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      } as unknown as Location,
    };
  }
}
