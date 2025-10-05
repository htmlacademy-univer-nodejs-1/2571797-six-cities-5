import {CommandInterface} from './command.interface.js';
import {TSVFileReader} from '../../shared/libs/file-reader/tsv-file-reader.js';
import chalk from 'chalk';

export class ImportCommand implements CommandInterface {
  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename);

    try {
      console.log(chalk.blue(`Importing data from file: ${filename}`));
      const offers = await fileReader.readOffers();

      console.log(chalk.green(`Successfully imported ${offers.length} offers`));
      console.log(chalk.blue('Sample offers:'));

      offers.slice(0, 3).forEach((offer, index) => {
        console.log(chalk.yellow(`${index + 1}. ${offer.title} - ${offer.city} - ${offer.price}€`));
      });

      if (offers.length > 3) {
        console.log(chalk.gray(`... and ${offers.length - 3} more offers`));
      }

    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.red(`Details: ${e.message}`));
    }
  }
}
