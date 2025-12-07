import {FileReader} from './file-reader.interface.js';
import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';
import {Offer} from '../../types';
import { stringToCity, stringToHousingType, stringsToComfortTypes, stringToUserType } from '../../utils/type-converters.js';

const REQUIRED_FIELDS_COUNT = 21;
const HEADER_LINE_NUMBER = 1;
const DEFAULT_COMMENTS_COUNT = 0;

export class TSVFileReader implements FileReader {
  constructor(
    private readonly filename: string
  ) {
  }

  public async readOffers(): Promise<Offer[]> {
    const offers: Offer[] = [];
    const fileStream = createReadStream(this.filename, {encoding: 'utf-8'});
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

      if (lineNumber === HEADER_LINE_NUMBER && line.includes('title\tdescription')) {
        continue;
      }

      try {
        const offer = this.parseLine(line, lineNumber);
        offers.push(offer);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: Failed to parse line ${lineNumber}: ${errorMessage}`);
      }
    }

    return offers;
  }

  private parseLine(line: string, _lineNumber: number): Offer {
    const fields = line.split('\t');

    if (fields.length < REQUIRED_FIELDS_COUNT) {
      throw new Error(`Invalid TSV format: expected ${REQUIRED_FIELDS_COUNT} fields, got ${fields.length}`);
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
      city: stringToCity(city),
      previewImage,
      images: images.split(';'),
      isPremium: isPremium === 'true',
      isFavorite: isFavorite === 'true',
      rating: parseFloat(rating),
      housingType: stringToHousingType(housingType),
      rooms: parseInt(rooms, 10),
      maxGuests: parseInt(maxGuests, 10),
      price: parseInt(price, 10),
      comforts: stringsToComfortTypes(comforts.split(';')),
      author: {
        name: authorName,
        email: authorEmail,
        avatar: authorAvatar,
        password,
        type: stringToUserType(type)
      },
      commentsCount: DEFAULT_COMMENTS_COUNT,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
    };
  }
}
