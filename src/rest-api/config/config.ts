import 'dotenv/config.js';
import convict from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';

convict.addFormat(convictFormatWithValidator.ipaddress);
convict.addFormat(convictFormatWithValidator.url);

export const config = convict({
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 4000,
    env: 'PORT'
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'DB_HOST'
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 27017,
      env: 'DB_PORT'
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'six-cities',
      env: 'DB_NAME'
    },
    username: {
      doc: 'Database username',
      format: String,
      default: 'admin',
      env: 'DB_USERNAME'
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'password123',
      env: 'DB_PASSWORD'
    }
  },
  salt: {
    doc: 'Salt for password hashing',
    format: String,
    default: '',
    env: 'SALT'
  },
  jwt: {
    secret: {
      doc: 'JWT secret key for token signing',
      format: String,
      default: '',
      env: 'JWT_SECRET'
    },
    expiresIn: {
      doc: 'JWT token expiration time',
      format: String,
      default: '7d',
      env: 'JWT_EXPIRES_IN'
    }
  },
  logLevel: {
    doc: 'Logging level',
    format: String,
    default: 'info',
    env: 'LOG_LEVEL'
  }
});

config.validate({ allowed: 'strict' });

const salt = config.get('salt') as string;
const jwtSecret = (config.get('jwt') as { secret: string }).secret;

if (!salt || salt.trim() === '') {
  throw new Error('SALT environment variable is required and cannot be empty');
}

if (!jwtSecret || jwtSecret.trim() === '') {
  throw new Error('JWT_SECRET environment variable is required and cannot be empty');
}
