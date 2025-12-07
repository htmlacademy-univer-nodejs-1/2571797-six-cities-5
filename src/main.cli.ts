#!/usr/bin/env node

import { CLIApplication, HelpCommand, VersionCommand, ImportCommand, GenerateCommand } from './cli';

async function bootstrap() {
  const cliApplication = new CLIApplication();
  cliApplication.registerCommands([
    new HelpCommand(),
    new VersionCommand(),
    new ImportCommand(),
    new GenerateCommand()
  ]);

  await cliApplication.processCommand(process.argv);
}

bootstrap().catch((error) => {
  console.error('Failed to start CLI:', error);
  throw error;
});
