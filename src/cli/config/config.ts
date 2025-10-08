import 'dotenv/config.js';
import convict from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';

convict.addFormat(convictFormatWithValidator.ipaddress);
convict.addFormat(convictFormatWithValidator.url);

export const config = convict({
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
  }
});

config.validate({ allowed: 'strict' });

