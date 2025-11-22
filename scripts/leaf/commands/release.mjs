import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { runCommand } from '../utils/exec.mjs';

export default (program) => {
  const release = program
    .command('release')
    .description('Build production releases for Android/iOS');

  // Android release
  release
    .command('android')
    .description('Build Android release (APK/AAB)')
    .option('--aab', 'Build Android App Bundle (AAB) instead of APK')
    .action(async (options) => {
      console.log(chalk.cyan('\n📦 Build Android Release\n'));

      // Check if android platform exists
      if (!fs.existsSync(path.join(process.cwd(), 'android'))) {
        console.log(chalk.red('❌ Android platform not found'));
        console.log(chalk.gray('Run'), chalk.bold('leaf setup'), chalk.gray('first\n'));
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'buildType',
          message: 'Select build type:',
          choices: [
            { name: '📦 APK (for testing/distribution)', value: 'apk' },
            { name: '🎁 AAB (for Play Store)', value: 'aab' },
          ],
          default: options.aab ? 'aab' : 'apk',
        },
        {
          type: 'confirm',
          name: 'buildWeb',
          message: 'Build web app first?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'bumpVersion',
          message: 'Bump version number?',
          default: true,
        },
      ]);

      console.log('');

      try {
        // Bump version
        if (answers.bumpVersion) {
          const versionAnswers = await inquirer.prompt([
            {
              type: 'list',
              name: 'versionType',
              message: 'Version bump type:',
              choices: [
                { name: 'Patch (1.0.0 → 1.0.1)', value: 'patch' },
                { name: 'Minor (1.0.0 → 1.1.0)', value: 'minor' },
                { name: 'Major (1.0.0 → 2.0.0)', value: 'major' },
              ],
            },
          ]);

          const versionSpinner = ora('Bumping version...').start();
          try {
            await runCommand(`npm version ${versionAnswers.versionType} --no-git-tag-version`);
            versionSpinner.succeed(chalk.green('Version bumped'));
          } catch (error) {
            versionSpinner.fail(chalk.red('Version bump failed'));
            throw error;
          }
        }

        // Build web app
        if (answers.buildWeb) {
          const leafConfig = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
          );
          const buildCommand = leafConfig.scripts?.build || 'npm run build';

          const webSpinner = ora(`Building web app (${buildCommand})...`).start();
          try {
            await runCommand(buildCommand);
            webSpinner.succeed(chalk.green('Web app built'));
          } catch (error) {
            webSpinner.fail(chalk.red('Web build failed'));
            throw error;
          }
        }

        // Sync with Capacitor
        const leafConfig = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
        );
        const webDir = leafConfig.webDir || 'dist';
        const webDirPath = path.join(process.cwd(), webDir);

        if (!fs.existsSync(webDirPath)) {
          console.log(chalk.red(`❌ Web assets not found at ${webDir}/`));
          console.log(chalk.gray('You must build the web app first\n'));
          process.exit(1);
        }

        const syncSpinner = ora('Syncing with Capacitor...').start();
        try {
          await runCommand('npx cap sync android');
          syncSpinner.succeed(chalk.green('Synced with Capacitor'));
        } catch (error) {
          syncSpinner.fail(chalk.red('Sync failed'));
          throw error;
        }

        // Build release
        console.log(chalk.cyan(`\n🔨 Building ${answers.buildType.toUpperCase()}...\n`));

        try {
          const gradleCommand =
            answers.buildType === 'aab'
              ? 'cd android && ./gradlew bundleRelease'
              : 'cd android && ./gradlew assembleRelease';

          // Run gradle with output visible
          const { execSync } = await import('child_process');
          execSync(gradleCommand, { stdio: 'inherit' });

          console.log(chalk.green(`\n✅ ${answers.buildType.toUpperCase()} built successfully\n`));

          // Find the output file
          const outputDir =
            answers.buildType === 'aab'
              ? 'android/app/build/outputs/bundle/release'
              : 'android/app/build/outputs/apk/release';

          // Check for both signed and unsigned files
          const signedFile = answers.buildType === 'aab' ? 'app-release.aab' : 'app-release.apk';
          const unsignedFile =
            answers.buildType === 'aab' ? 'app-release-unsigned.aab' : 'app-release-unsigned.apk';

          const signedPath = path.join(process.cwd(), outputDir, signedFile);
          const unsignedPath = path.join(process.cwd(), outputDir, unsignedFile);

          let outputFile = signedPath;
          let isSigned = true;

          if (!fs.existsSync(signedPath) && fs.existsSync(unsignedPath)) {
            outputFile = unsignedPath;
            isSigned = false;
          }

          console.log(chalk.cyan('📝 Release Details:\n'));
          console.log(chalk.gray(`  Output: ${outputFile}`));

          if (fs.existsSync(outputFile)) {
            const stats = fs.statSync(outputFile);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(chalk.gray(`  Size: ${sizeMB} MB`));
            console.log(chalk.gray(`  Signed: ${isSigned ? chalk.green('Yes') : chalk.red('No')}`));
          }

          if (!isSigned) {
            console.log(chalk.yellow('\n⚠️  Warning: APK is UNSIGNED\n'));
            console.log(
              chalk.gray('  This APK cannot be distributed or installed on most devices.')
            );
            console.log(chalk.gray('  To create a signed APK:\n'));
            console.log(chalk.cyan('  1. Generate a keystore:'), chalk.bold('leaf cert android'));
            console.log(
              chalk.cyan('  2. Configure signing in'),
              chalk.bold('android/app/build.gradle')
            );
            console.log(
              chalk.cyan('  3. Add keystore credentials to'),
              chalk.bold('android/gradle.properties')
            );
            console.log('');
          }

          console.log(chalk.cyan('📋 Next Steps:\n'));
          if (answers.buildType === 'aab') {
            console.log(chalk.gray('  1. Upload to Google Play Console'));
            console.log(chalk.gray('  2. Create a new release'));
            console.log(chalk.gray('  3. Upload the AAB file'));
          } else {
            if (isSigned) {
              console.log(chalk.gray('  1. Test the APK on a device'));
              console.log(
                chalk.gray('  2. Distribute via Firebase, TestFlight, or direct download')
              );
            } else {
              console.log(chalk.gray('  1. Configure signing (see warning above)'));
              console.log(chalk.gray('  2. Rebuild to create a signed APK'));
            }
          }
          console.log('');
        } catch (error) {
          console.error(chalk.red('\n❌ Build failed'));
          console.error(chalk.red(error.message));
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        process.exit(1);
      }
    });

  // iOS release
  release
    .command('ios')
    .description('Build iOS release archive')
    .action(async () => {
      console.log(chalk.cyan('\n🍎 Build iOS Release\n'));

      // Check if ios platform exists
      if (!fs.existsSync(path.join(process.cwd(), 'ios'))) {
        console.log(chalk.red('❌ iOS platform not found'));
        console.log(chalk.gray('Run'), chalk.bold('leaf setup'), chalk.gray('first\n'));
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'buildWeb',
          message: 'Build web app first?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'bumpVersion',
          message: 'Bump version number?',
          default: true,
        },
      ]);

      console.log('');

      try {
        // Bump version
        if (answers.bumpVersion) {
          const versionAnswers = await inquirer.prompt([
            {
              type: 'list',
              name: 'versionType',
              message: 'Version bump type:',
              choices: [
                { name: 'Patch (1.0.0 → 1.0.1)', value: 'patch' },
                { name: 'Minor (1.0.0 → 1.1.0)', value: 'minor' },
                { name: 'Major (1.0.0 → 2.0.0)', value: 'major' },
              ],
            },
          ]);

          const versionSpinner = ora('Bumping version...').start();
          try {
            await runCommand(`npm version ${versionAnswers.versionType} --no-git-tag-version`);
            versionSpinner.succeed(chalk.green('Version bumped'));
          } catch (error) {
            versionSpinner.fail(chalk.red('Version bump failed'));
            throw error;
          }
        }

        // Build web app
        if (answers.buildWeb) {
          const leafConfig = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
          );
          const buildCommand = leafConfig.scripts?.build || 'npm run build';

          const webSpinner = ora(`Building web app (${buildCommand})...`).start();
          try {
            await runCommand(buildCommand);
            webSpinner.succeed(chalk.green('Web app built'));
          } catch (error) {
            webSpinner.fail(chalk.red('Web build failed'));
            throw error;
          }
        }

        // Sync with Capacitor
        const leafConfig = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
        );
        const webDir = leafConfig.webDir || 'dist';
        const webDirPath = path.join(process.cwd(), webDir);

        if (!fs.existsSync(webDirPath)) {
          console.log(chalk.red(`❌ Web assets not found at ${webDir}/`));
          console.log(chalk.gray('You must build the web app first\n'));
          process.exit(1);
        }

        const syncSpinner = ora('Syncing with Capacitor...').start();
        try {
          await runCommand('npx cap sync ios');
          syncSpinner.succeed(chalk.green('Synced with Capacitor'));
        } catch (error) {
          syncSpinner.fail(chalk.red('Sync failed'));
          throw error;
        }

        console.log(chalk.cyan('\n📝 iOS Release:\n'));
        console.log(chalk.gray('  iOS releases must be built from Xcode'));
        console.log('');

        console.log(chalk.cyan('📋 Next Steps:\n'));
        console.log(chalk.gray('  1. Open Xcode:'), chalk.bold('npx cap open ios'));
        console.log(chalk.gray('  2. Select "Any iOS Device" as the build target'));
        console.log(chalk.gray('  3. Product → Archive'));
        console.log(chalk.gray('  4. Distribute to App Store or export IPA'));
        console.log('');

        const openXcode = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'open',
            message: 'Open Xcode now?',
            default: true,
          },
        ]);

        if (openXcode.open) {
          const openSpinner = ora('Opening Xcode...').start();
          try {
            await runCommand('npx cap open ios');
            openSpinner.succeed(chalk.green('Xcode opened'));
          } catch (error) {
            openSpinner.fail(chalk.red('Failed to open Xcode'));
          }
        }
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        process.exit(1);
      }
    });
};
