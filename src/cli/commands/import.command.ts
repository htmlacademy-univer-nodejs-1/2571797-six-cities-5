import {CommandInterface} from './command.interface.js';
import {TSVFileReader} from '../../shared/libs/file-reader/tsv-file-reader.js';
import {DatabaseClient} from '../../rest-api/database/database.js';
import {UserService} from '../../rest-api/services/user.service.js';
import {OfferService} from '../../rest-api/services/offer.service.js';
import {FavoriteService} from '../../rest-api/services/favorite.service.js';
import type {UserEntity} from '../../rest-api/models/user.model.js';
import type {OfferEntity} from '../../rest-api/models/offer.model.js';
import {config} from '../../rest-api/config/config.js';
import {Types} from 'mongoose';
import chalk from 'chalk';
import { stringToCity, stringToHousingType, stringsToComfortTypes } from '../../shared/utils/type-converters.js';

export class ImportCommand implements CommandInterface {
  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename, dbHost, dbPort, dbName, dbUsername, dbPassword] = parameters;

    if (!filename) {
      console.error(chalk.red('Error: Please provide a filename'));
      console.error(chalk.yellow('Usage: --import <filename> [dbHost] [dbPort] [dbName] [dbUsername] [dbPassword]'));
      return;
    }

    const fileReader = new TSVFileReader(filename);
    const databaseClient = DatabaseClient.getInstance();
    const cliConfig = {
      get: (key: string): string | number | object => config.get(key as never) as string | number | object
    };
    const userService = new UserService(cliConfig);
    const favoriteService = new FavoriteService();
    const offerService = new OfferService(favoriteService);

    try {
      console.log(chalk.blue(`Importing data from file: ${filename}`));

      const dbConfig = {
        host: dbHost || config.get('db.host'),
        port: dbPort ? parseInt(dbPort, 10) : config.get('db.port'),
        name: dbName || config.get('db.name'),
        username: dbUsername || config.get('db.username'),
        password: dbPassword || config.get('db.password')
      };

      console.log(chalk.blue(`Connecting to database: ${dbConfig.username}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`));

      config.set('db.host', dbConfig.host);
      config.set('db.port', dbConfig.port);
      config.set('db.name', dbConfig.name);
      config.set('db.username', dbConfig.username);
      config.set('db.password', dbConfig.password);

      await databaseClient.connect();

      const offers = await fileReader.readOffers();
      console.log(chalk.blue(`Found ${offers.length} offers to import`));

      let importedUsers = 0;
      let importedOffers = 0;
      const userMap = new Map<string, string>();

      for (const offer of offers) {
        try {
          let userId = userMap.get(offer.author.email);

          if (!userId) {
            const existingUser = await userService.findByEmail(offer.author.email);
            if (existingUser) {
              userId = existingUser._id.toString();
              userMap.set(offer.author.email, userId);
            } else {
              const userData: Partial<UserEntity> = {
                name: offer.author.name,
                email: offer.author.email,
                avatar: offer.author.avatar,
                password: offer.author.password,
                type: offer.author.type
              };

              const newUser = await userService.createWithHashedPassword(userData);
              userId = newUser._id.toString();
              userMap.set(offer.author.email, userId);
              importedUsers++;
            }
          }

          const offerData: Partial<OfferEntity> = {
            title: offer.title,
            description: offer.description,
            postDate: offer.postDate,
            city: stringToCity(offer.city),
            previewImage: offer.previewImage,
            images: offer.images,
            isPremium: offer.isPremium,
            rating: offer.rating,
            housingType: stringToHousingType(offer.housingType),
            rooms: offer.rooms,
            maxGuests: offer.maxGuests,
            price: offer.price,
            comforts: stringsToComfortTypes(offer.comforts),
            author: new Types.ObjectId(userId),
            commentsCount: offer.commentsCount,
            location: {
              latitude: offer.location.latitude,
              longitude: offer.location.longitude
            }
          };

          await offerService.create(offerData);
          importedOffers++;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(chalk.yellow(`Warning: Failed to import offer "${offer.title}": ${errorMessage}`));
        }
      }

      console.log(chalk.green('Successfully imported:'));
      console.log(chalk.green(`  - ${importedUsers} users`));
      console.log(chalk.green(`  - ${importedOffers} offers`));

    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.red(`Details: ${e.message}`));
    } finally {
      await databaseClient.disconnect();
    }
  }
}
