import 'reflect-metadata';
import { Container } from 'inversify';
import { Logger } from 'pino';
import { logger } from '../logger/logger.js';
import { config } from '../config/config.js';
import { Application } from '../core/application.js';

export const container = new Container();

container.bind<Logger>('Logger').toConstantValue(logger);

container.bind('Config').toConstantValue(config);

container.bind<Application>('Application').to(Application);
