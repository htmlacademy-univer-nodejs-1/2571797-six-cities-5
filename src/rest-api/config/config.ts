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
    }
  },
  salt: {
    doc: 'Salt for password hashing',
    format: String,
    default: '',
    env: 'SALT'
  }
});

config.validate({ allowed: 'strict' });
