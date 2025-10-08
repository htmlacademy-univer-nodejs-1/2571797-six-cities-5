import {CommandInterface} from './command.interface';
import chalk from 'chalk';

export class HelpCommand implements CommandInterface {
  public getName(): string {
    return '--help';
  }

  public execute(..._param: string[]): void {
    console.log(`
      Программа для подготовки данных для REST API сервера.
      Пример: ${chalk.redBright('cli.js')} ${chalk.green('--<command>')} ${chalk.blueBright('[--arguments]')}
      Команды:
        ${chalk.green('--version')}:                          ${chalk.yellow('# выводит номер версии')}
        ${chalk.green('--help')}:                             ${chalk.yellow('# печатает этот текст')}
        ${chalk.green('--import') + chalk.blueBright(' <path> [dbHost] [dbPort] [dbName] [dbUsername] [dbPassword]')}:  ${chalk.yellow('# импортирует данные из TSV в MongoDB')}
        ${chalk.green('--generate') + chalk.blueBright(' <n> <path> <url>')}:        ${chalk.yellow('# генерирует произвольное количество тестовых данных')}
    `);
  }
}
