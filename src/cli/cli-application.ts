import {CommandInterface} from './commands/command.interface';
import {CommandParser} from './command-parser.js';

type CommandCollection = Record<string, CommandInterface>

export class CLIApplication {
  private registeredCommands: CommandCollection = {};

  constructor(
    private readonly defaultCommand: string = '--help'
  ) {
  }

  public registerCommands(commands: CommandInterface[]): void {
    commands.forEach((command) => {
      if (Object.hasOwn(this.registeredCommands, command.getName())) {
        throw new Error(`This command (${command.getName()}) is already registered`);
      }
      this.registeredCommands[command.getName()] = command;
    });
  }

  private getCommand(command: string): CommandInterface {
    return this.registeredCommands[command] ?? this.registeredCommands[this.defaultCommand];
  }

  public async processCommand(data: string[]): Promise<void> {
    const parsedData = CommandParser.parse(data);
    const [commandName] = Object.keys(parsedData);
    const command = this.getCommand(commandName);
    const commandArg = parsedData[command.getName()] ?? [];
    await command.execute(...commandArg);
  }
}
