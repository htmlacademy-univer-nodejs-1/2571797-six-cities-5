import {CommandInterface} from './command.interface';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import chalk from 'chalk';

type JSONData = {
  version: string;
}

function isJSONData(data: unknown): data is JSONData {
  return (typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    Object.hasOwn(data, 'version'));
}

export class VersionCommand implements CommandInterface {
  constructor(
    private readonly filePath: string = './package.json',
  ) {
  }

  private readVersion(): string {
    const importedData = JSON.parse(readFileSync(resolve(this.filePath), 'utf8'));
    if (!isJSONData(importedData)) {
      throw new Error(chalk.red('Failed to parse json'));
    }
    return importedData.version;
  }

  public getName(): string {
    return '--version';
  }

  public execute(..._params: string[]): void {
    try {
      const version = this.readVersion();
      console.info(chalk.green(version));
    } catch (err: unknown) {
      console.error(chalk.red(`Error reading version from ${this.filePath}`));
    }
  }
}
