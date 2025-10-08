import { container } from './rest-api/container/container.js';
import { Application } from './rest-api/core/application.js';

async function bootstrap() {
  const application = container.get<Application>('Application');
  await application.init();
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  throw error;
});
