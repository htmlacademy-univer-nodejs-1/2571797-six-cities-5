import { injectable, inject } from 'inversify';
import { Logger } from 'pino';

interface Config {
  get(key: string): string | number | object;
}

@injectable()
export class Application {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject('Config') private readonly config: Config
  ) {}

  public async init(): Promise<void> {
    this.logger.info('Application initialized');
    this.logger.info(`Port: ${this.config.get('port')}`);
  }
}
