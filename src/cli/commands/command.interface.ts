export interface CommandInterface {
  getName(): string;
  execute(...param: string[]): void;
}
