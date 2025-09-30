import {CommandInterface} from './command.interface';
import {TSVFileReader} from '../../shared/libs/file-reader';
import chalk from 'chalk';

export class ImportCommand implements CommandInterface {
  public getName(): string {
    return '--import';
  }

  public execute(...parameters: string[]): void {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename);
    try {
      fileReader.read();
      console.log(fileReader.toArray());
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.red(`Details: ${e.message}`));
    }
  }
}
