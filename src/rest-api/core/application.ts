import express, { Express } from 'express';
import path from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { ExceptionFilter } from './exception-filter/exception-filter.js';
import { AuthController } from '../controllers/auth/auth.controller.js';
import { OfferController } from '../controllers/offer/offer.controller.js';
import { FavoriteController } from '../controllers/favorite/favorite.controller.js';
import { CommentController } from '../controllers/comment/comment.controller.js';
import { DatabaseClient } from '../database/database.js';

interface Config {
  get(key: string): string | number | object;
}

@injectable()
export class Application {
  private expressApp: Express;

  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject('Config') private readonly config: Config,
    @inject('ExceptionFilter') private readonly exceptionFilter: ExceptionFilter,
    @inject('AuthController') private readonly authController: AuthController,
    @inject('OfferController') private readonly offerController: OfferController,
    @inject('FavoriteController') private readonly favoriteController: FavoriteController,
    @inject('CommentController') private readonly commentController: CommentController,
    @inject('DatabaseClient') private readonly databaseClient: DatabaseClient
  ) {
    this.expressApp = express();
  }

  public async init(): Promise<void> {
    this.logger.info('Application initialization started');

    await this.databaseClient.connect();

    this.initMiddleware();
    this.initRoutes();
    this.initExceptionFilter();

    const port = this.config.get('port') as number;
    this.expressApp.listen(port, () => {
      this.logger.info(`Server started on port ${port}`);
    });
  }

  private initMiddleware(): void {
    this.expressApp.use(express.json());
    const uploadDirectory = path.resolve(this.config.get('uploadDirectory') as string);
    const staticDirectory = path.resolve('markup');

    this.ensureDirectoryExists(uploadDirectory);

    this.expressApp.use('/upload', express.static(uploadDirectory));
    this.expressApp.use('/', express.static(staticDirectory));
  }

  private initRoutes(): void {
    this.expressApp.use('/api/auth', this.authController.getRouter());
    this.expressApp.use('/api/offers', this.offerController.getRouter());
    this.expressApp.use('/api/offers', this.commentController.getRouter());
    this.expressApp.use('/api/favorites', this.favoriteController.getRouter());
  }

  private initExceptionFilter(): void {
    this.expressApp.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  private ensureDirectoryExists(directoryPath: string): void {
    if (!existsSync(directoryPath)) {
      mkdirSync(directoryPath, { recursive: true });
    }
  }
}
