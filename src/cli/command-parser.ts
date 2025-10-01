type ParsedCommand = Record<string, string[]>

export class CommandParser {
  static parse(cliArg: string[]): ParsedCommand {
    const parsedCommand: ParsedCommand = {};
    let curCommand = '';
    for (const arg of cliArg) {
      if (arg.startsWith('--')) {
        parsedCommand[arg] = [];
        curCommand = arg;
      } else if (curCommand && arg) {
        parsedCommand[curCommand].push(arg);
      }
    }
    return parsedCommand;
  }
}
