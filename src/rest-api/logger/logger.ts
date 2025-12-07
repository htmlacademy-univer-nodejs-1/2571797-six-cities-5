import pino from 'pino';
import { config } from '../config/config.js';

export const logger = pino({
  level: config.get('logLevel') as string,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});
