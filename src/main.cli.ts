#!/usr/bin/env node

import { CLIApplication, HelpCommand, VersionCommand, ImportCommand, GenerateCommand } from './cli/index.js';

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

bootstrap();
