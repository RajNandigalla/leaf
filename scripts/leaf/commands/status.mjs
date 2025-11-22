import chalk from 'chalk';
import boxen from 'boxen';
import figures from 'figures';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('status')
    .description('Check Capacitor installation status')
    .action(() => {
      const status = checkInstallation();

      console.log('');

      // Header
      console.log(chalk.bold.cyan('📊 Capacitor Status\n'));

      // Dependencies status
      const depsIcon = status.depsInstalled ? chalk.green(figures.tick) : chalk.red(figures.cross);
      const depsText = status.depsInstalled ? chalk.green('Installed') : chalk.red('Not installed');
      console.log(`${depsIcon} Dependencies: ${depsText}`);

      if (status.depsInstalled) {
        console.log(chalk.gray(`   ${status.installedDeps}/${status.totalDeps} packages`));
      }

      // Platforms status
      console.log(`\n${chalk.bold('Platforms:')}`);
      const iosIcon = status.platforms.ios ? chalk.green(figures.tick) : chalk.gray(figures.circle);
      const androidIcon = status.platforms.android
        ? chalk.green(figures.tick)
        : chalk.gray(figures.circle);
      console.log(
        `${iosIcon} iOS ${status.platforms.ios ? chalk.green('(configured)') : chalk.gray('(not configured)')}`
      );
      console.log(
        `${androidIcon} Android ${status.platforms.android ? chalk.green('(configured)') : chalk.gray('(not configured)')}`
      );

      // Overall status box
      console.log('');
      let statusMessage;
      let boxColor;

      if (status.isFullyInstalled) {
        statusMessage = chalk.green.bold('✨ Capacitor is fully installed and ready!');
        boxColor = 'green';
      } else if (status.depsInstalled) {
        statusMessage = chalk.yellow.bold('⚠️  Capacitor is partially installed');
        boxColor = 'yellow';
      } else {
        statusMessage = chalk.red.bold('❌ Capacitor is not installed');
        boxColor = 'red';
      }

      console.log(
        boxen(statusMessage, {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: boxColor,
        })
      );

      // Suggestions
      if (!status.isFullyInstalled) {
        console.log(chalk.cyan('💡 Suggestions:\n'));
        if (!status.depsInstalled) {
          console.log(
            chalk.gray('  • Run'),
            chalk.bold('leaf install'),
            chalk.gray('to install Capacitor')
          );
        }
        if (!status.platforms.ios && !status.platforms.android) {
          console.log(
            chalk.gray('  • Run'),
            chalk.bold('leaf setup'),
            chalk.gray('to add platforms')
          );
        }
        console.log('');
      }
    });
};
