/* eslint-disable no-use-before-define */
import mongoose from 'mongoose';
import { logger } from '../logger/logger.js';
import { config } from '../config/config.js';

export class DatabaseClient {
  private static instance: DatabaseClient | undefined;

  public constructor() {
    // Singleton pattern
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public async connect(): Promise<void> {
    const { host, port, name, username, password } = config.get('db');
    const uri = `mongodb://${username}:${password}@${host}:${port}/${name}?authSource=admin`;

    try {
      logger.info('Connecting to MongoDB...');
      await mongoose.connect(uri);
      logger.info('Successfully connected to MongoDB');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to connect to MongoDB: %s', errorMessage);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      logger.info('Disconnecting from MongoDB...');
      await mongoose.disconnect();
      logger.info('Successfully disconnected from MongoDB');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to disconnect from MongoDB: %s', errorMessage);
      throw error;
    }
  }
}

