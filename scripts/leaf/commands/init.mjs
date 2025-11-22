import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { runCommand } from '../utils/exec.mjs';

const LEAF_CONFIG_FILE = 'leaf.json';

async function getLatestVersion(packageName) {
  try {
    const version = await runCommand(`npm view ${packageName} version`, { encoding: 'utf8' });
    return version.trim();
  } catch (error) {
    return 'latest'; // Fallback if npm view fails
  }
}

export default (program) => {
  program
    .command('init')
    .description('Generate leaf.json with latest Capacitor versions')
    .action(async () => {
      console.log(chalk.cyan('\n📄 Initialize Leaf Configuration\n'));

      const configPath = path.join(process.cwd(), LEAF_CONFIG_FILE);

      if (fs.existsSync(configPath)) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `${LEAF_CONFIG_FILE} already exists. Overwrite?`,
            default: false,
          },
        ]);

        if (!answers.overwrite) {
          console.log(chalk.yellow('\n⚠️  Initialization cancelled\n'));
          return;
        }
      }

      const spinner = ora('Fetching latest Capacitor versions...').start();

      try {
        const coreVersion = `^${await getLatestVersion('@capacitor/core')}`;
        const cliVersion = `^${await getLatestVersion('@capacitor/cli')}`;
        const appVersion = `^${await getLatestVersion('@capacitor/app')}`;
        const androidVersion = `^${await getLatestVersion('@capacitor/android')}`;
        const iosVersion = `^${await getLatestVersion('@capacitor/ios')}`;

        const leafConfig = {
          name: 'capacitor-dependencies',
          description: 'Capacitor and native platform dependencies',
          version: '1.0.0',
          scripts: {
            build: 'npm run build',
          },
          dependencies: {
            '@capacitor/core': coreVersion,
            '@capacitor/cli': cliVersion,
            '@capacitor/app': appVersion,
          },
          devDependencies: {
            '@capacitor/android': androidVersion,
            '@capacitor/ios': iosVersion,
          },
        };

        fs.writeFileSync(configPath, JSON.stringify(leafConfig, null, 4));

        spinner.succeed(chalk.green(`Successfully generated ${LEAF_CONFIG_FILE}`));
        console.log(chalk.gray('\nVersions found:'));
        console.log(chalk.gray(`  Core: ${coreVersion}`));
        console.log(chalk.gray(`  CLI:  ${cliVersion}`));
        console.log(chalk.gray(`  App:  ${appVersion}`));

        console.log(chalk.green('\n✨ Initialization complete!'));
        console.log(
          chalk.gray('Run'),
          chalk.bold('leaf install'),
          chalk.gray('to install these dependencies.\n')
        );
      } catch (error) {
        spinner.fail(chalk.red('Failed to generate configuration'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
};
