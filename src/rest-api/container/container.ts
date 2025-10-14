import 'reflect-metadata';
import { Container } from 'inversify';
import { Logger } from 'pino';
import { logger } from '../logger/logger.js';
import { config } from '../config/config.js';
import { Application } from '../core/application.js';
import { DatabaseClient } from '../database/database.js';
import { UserService } from '../services/user.service.js';
import { OfferService } from '../services/offer.service.js';
import { CommentService } from '../services/comment.service.js';
import { FavoriteService } from '../services/favorite.service.js';
import { AuthService } from '../services/auth.service.js';
import {
  UserDatabaseService,
  OfferDatabaseService,
  CommentDatabaseService,
  FavoriteDatabaseService
} from '../interfaces/database.interface.js';

export const container = new Container();

container.bind<Logger>('Logger').toConstantValue(logger);

container.bind('Config').toConstantValue(config);

container.bind<Application>('Application').to(Application);

container.bind<DatabaseClient>('DatabaseClient').to(DatabaseClient).inSingletonScope();

container.bind<UserDatabaseService>('UserService').to(UserService);
container.bind<OfferDatabaseService>('OfferService').to(OfferService);
container.bind<CommentDatabaseService>('CommentService').to(CommentService);
container.bind<FavoriteDatabaseService>('FavoriteService').to(FavoriteService);
container.bind<AuthService>('AuthService').to(AuthService);
