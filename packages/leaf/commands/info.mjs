import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import figures from 'figures';

export default (program) => {
  program
    .command('info')
    .description('Display project information and configuration')
    .action(() => {
      console.log(chalk.cyan('\n📊 Project Information\n'));

      try {
        // Read package.json
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
        );

        // Read leaf.json
        const leafConfig = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
        );

        // Read capacitor.config if exists
        let capConfig = null;
        const configPaths = ['capacitor.config.ts', 'capacitor.config.json', 'capacitor.config.js'];

        for (const configPath of configPaths) {
          const fullPath = path.join(process.cwd(), configPath);
          if (fs.existsSync(fullPath)) {
            if (configPath.endsWith('.json')) {
              capConfig = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            } else {
              // For .ts/.js files, just note it exists
              capConfig = { _file: configPath };
            }
            break;
          }
        }

        // Project Info
        console.log(
          boxen(
            chalk.bold.white(
              `${packageJson.name || 'Unknown Project'} v${packageJson.version || '0.0.0'}`
            ),
            {
              padding: 1,
              margin: { top: 0, bottom: 1, left: 0, right: 0 },
              borderStyle: 'round',
              borderColor: 'cyan',
            }
          )
        );

        // Capacitor Configuration
        if (capConfig) {
          console.log(chalk.bold('Capacitor Configuration:'));
          if (capConfig._file) {
            console.log(chalk.gray(`  Config file: ${capConfig._file}`));
          } else {
            console.log(chalk.gray(`  App Name: ${capConfig.appName || 'N/A'}`));
            console.log(chalk.gray(`  App ID: ${capConfig.appId || 'N/A'}`));
            console.log(chalk.gray(`  Web Dir: ${capConfig.webDir || 'N/A'}`));
          }
          console.log('');
        } else {
          console.log(chalk.yellow(`${figures.warning} Capacitor not initialized\n`));
        }

        // Platforms
        console.log(chalk.bold('Platforms:'));
        const iosExists = fs.existsSync(path.join(process.cwd(), 'ios'));
        const androidExists = fs.existsSync(path.join(process.cwd(), 'android'));

        console.log(
          `  ${iosExists ? chalk.green(figures.tick) : chalk.gray(figures.circle)} iOS ${
            iosExists ? chalk.green('(configured)') : chalk.gray('(not configured)')
          }`
        );
        console.log(
          `  ${androidExists ? chalk.green(figures.tick) : chalk.gray(figures.circle)} Android ${
            androidExists ? chalk.green('(configured)') : chalk.gray('(not configured)')
          }`
        );
        console.log('');

        // Dependencies
        const coreDeps = leafConfig.dependencies || {};
        const devDeps = leafConfig.devDependencies || {};
        const plugins = leafConfig.plugins || {};

        console.log(chalk.bold('Capacitor Dependencies:'));
        console.log(chalk.gray(`  Core: ${Object.keys(coreDeps).length} packages`));
        console.log(chalk.gray(`  Platforms: ${Object.keys(devDeps).length} packages`));
        console.log(chalk.gray(`  Plugins: ${Object.keys(plugins).length} installed`));
        console.log('');

        // Build Configuration
        console.log(chalk.bold('Build Configuration:'));
        if (leafConfig.scripts?.build) {
          console.log(chalk.gray(`  Build command: ${leafConfig.scripts.build}`));
        }
        if (leafConfig.webDir) {
          console.log(chalk.gray(`  Web directory: ${leafConfig.webDir}`));
        }
        console.log('');

        // Package Manager
        const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
        const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
        const hasPackageLock = fs.existsSync(path.join(process.cwd(), 'package-lock.json'));

        let packageManager = 'npm';
        if (hasYarnLock) packageManager = 'yarn';
        else if (hasPnpmLock) packageManager = 'pnpm';

        console.log(chalk.bold('Environment:'));
        console.log(chalk.gray(`  Package Manager: ${packageManager}`));
        console.log(chalk.gray(`  Node Version: ${process.version}`));
        console.log('');

        // Installed Plugins List
        if (Object.keys(plugins).length > 0) {
          console.log(chalk.bold('Installed Plugins:'));
          Object.entries(plugins).forEach(([name, version]) => {
            const isInstalled =
              packageJson.dependencies?.[name] || packageJson.devDependencies?.[name];

            const status = isInstalled ? chalk.green(figures.tick) : chalk.red(figures.cross);

            console.log(`  ${status} ${name} ${chalk.gray(version)}`);
          });
          console.log('');
        }
      } catch (error) {
        console.error(chalk.red('❌ Error reading project configuration'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
};
