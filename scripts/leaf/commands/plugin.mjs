import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { runCommand } from '../utils/exec.mjs';
import {
  getInstalledPlugins,
  addPluginToConfig,
  removePluginFromConfig,
  getPluginInfo,
  searchPlugins,
  getPopularPlugins,
} from '../utils/plugins.mjs';

export default (program) => {
  const plugin = program.command('plugin').description('Manage Capacitor plugins');

  // Add plugin
  plugin
    .command('add [plugin]')
    .description('Add a Capacitor plugin')
    .action(async (pluginName) => {
      console.log(chalk.cyan('\n📦 Add Plugin\n'));

      let selectedPlugin = pluginName;

      // If no plugin specified, show interactive selection
      if (!selectedPlugin) {
        const popular = getPopularPlugins();
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'plugin',
            message: 'Select a plugin to add:',
            choices: [
              ...popular.map((p) => ({ name: p, value: p })),
              { name: '🔍 Search for other plugins...', value: 'SEARCH' },
            ],
          },
        ]);

        if (answers.plugin === 'SEARCH') {
          const searchAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'query',
              message: 'Search for plugin:',
            },
          ]);

          const spinner = ora('Searching npm registry...').start();
          const results = await searchPlugins(searchAnswers.query);
          spinner.stop();

          if (results.length === 0) {
            console.log(chalk.yellow('\n⚠️  No plugins found\n'));
            return;
          }

          const selectAnswers = await inquirer.prompt([
            {
              type: 'list',
              name: 'plugin',
              message: 'Select a plugin:',
              choices: results.map((r) => ({
                name: `${r.name} - ${r.description}`,
                value: r.name,
              })),
            },
          ]);

          selectedPlugin = selectAnswers.plugin;
        } else {
          selectedPlugin = answers.plugin;
        }
      }

      // Check if already in config
      const installed = getInstalledPlugins();
      if (installed.some((p) => p.name === selectedPlugin)) {
        console.log(chalk.yellow(`\n⚠️  ${selectedPlugin} is already in leaf.json\n`));
        return;
      }

      // Fetch latest version
      const versionSpinner = ora('Fetching latest version...').start();
      const info = await getPluginInfo(selectedPlugin);

      if (!info) {
        versionSpinner.fail(chalk.red('Plugin not found on npm'));
        return;
      }

      const version = `^${info.version}`;
      versionSpinner.succeed(chalk.green(`Latest version: ${version}`));

      // Add to leaf.json
      addPluginToConfig(selectedPlugin, version);
      console.log(chalk.green(`✅ Added ${selectedPlugin} to leaf.json`));

      // Install via npm
      const installSpinner = ora(`Installing ${selectedPlugin}...`).start();
      try {
        await runCommand(`npm install ${selectedPlugin}@${version}`);
        installSpinner.succeed(chalk.green(`${selectedPlugin} installed`));
        console.log(chalk.green('\n✨ Plugin added successfully!\n'));
      } catch (error) {
        installSpinner.fail(chalk.red('Installation failed'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  // Remove plugin
  plugin
    .command('remove [plugin]')
    .alias('rm')
    .description('Remove a Capacitor plugin')
    .action(async (pluginName) => {
      console.log(chalk.cyan('\n🗑️  Remove Plugin\n'));

      let selectedPlugin = pluginName;

      // If no plugin specified, show installed plugins
      if (!selectedPlugin) {
        const installed = getInstalledPlugins();

        if (installed.length === 0) {
          console.log(chalk.yellow('⚠️  No plugins installed\n'));
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'plugin',
            message: 'Select a plugin to remove:',
            choices: installed.map((p) => ({
              name: `${p.name} (${p.version})`,
              value: p.name,
            })),
          },
        ]);

        selectedPlugin = answers.plugin;
      }

      // Confirm removal
      const confirmAnswers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Remove ${selectedPlugin}?`,
          default: false,
        },
      ]);

      if (!confirmAnswers.confirm) {
        console.log(chalk.yellow('\n⚠️  Removal cancelled\n'));
        return;
      }

      // Remove from leaf.json
      const removed = removePluginFromConfig(selectedPlugin);
      if (!removed) {
        console.log(chalk.yellow(`\n⚠️  ${selectedPlugin} not found in leaf.json\n`));
        return;
      }

      console.log(chalk.green(`✅ Removed ${selectedPlugin} from leaf.json`));

      // Uninstall via npm
      const uninstallSpinner = ora(`Uninstalling ${selectedPlugin}...`).start();
      try {
        await runCommand(`npm uninstall ${selectedPlugin}`);
        uninstallSpinner.succeed(chalk.green(`${selectedPlugin} uninstalled`));
        console.log(chalk.green('\n✨ Plugin removed successfully!\n'));
      } catch (error) {
        uninstallSpinner.fail(chalk.red('Uninstallation failed'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  // List plugins
  plugin
    .command('list')
    .alias('ls')
    .description('List installed plugins')
    .action(() => {
      console.log(chalk.cyan('\n📋 Installed Plugins\n'));

      const installed = getInstalledPlugins();

      if (installed.length === 0) {
        console.log(chalk.yellow('⚠️  No plugins installed\n'));
        return;
      }

      console.log(
        chalk.bold('Plugin Name'.padEnd(40)) +
          chalk.bold('Version'.padEnd(15)) +
          chalk.bold('Status')
      );
      console.log('─'.repeat(70));

      installed.forEach((plugin) => {
        const name = plugin.name.padEnd(40);
        const version = plugin.version.padEnd(15);
        const status = plugin.installed ? chalk.green('✓ Installed') : chalk.red('✗ Not installed');

        console.log(`${name}${version}${status}`);
      });

      console.log('');
    });

  // Search plugins
  plugin
    .command('search [query]')
    .description('Search for Capacitor plugins')
    .action(async (query) => {
      console.log(chalk.cyan('\n🔍 Search Plugins\n'));

      const spinner = ora('Searching npm registry...').start();
      const results = await searchPlugins(query || '');
      spinner.stop();

      if (results.length === 0) {
        console.log(chalk.yellow('⚠️  No plugins found\n'));
        return;
      }

      console.log(chalk.bold(`Found ${results.length} plugins:\n`));

      results.forEach((plugin) => {
        console.log(chalk.cyan(`${plugin.name}`) + chalk.gray(` v${plugin.version}`));
        console.log(chalk.gray(`  ${plugin.description}`));
        console.log('');
      });
    });
};
