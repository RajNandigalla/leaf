import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { runCommand } from '../utils/exec.mjs';

export default (program) => {
  const cert = program
    .command('cert')
    .description('Generate signing certificates')
    .showHelpAfterError(false)
    .configureHelp({ showGlobalOptions: false });

  // Android keystore
  cert
    .command('android')
    .description('Generate Android keystore for app signing')
    .action(async () => {
      console.log(chalk.cyan('\n🔐 Generate Android Keystore\n'));

      // Check if keytool is available
      try {
        await runCommand('keytool -help');
      } catch (error) {
        console.log(chalk.red('❌ keytool not found. Please install Java JDK.'));
        console.log(
          chalk.gray('\nDownload from: https://www.oracle.com/java/technologies/downloads/\n')
        );
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'alias',
          message: 'Keystore alias:',
          default: 'upload',
        },
        {
          type: 'input',
          name: 'filename',
          message: 'Keystore filename:',
          default: 'upload-keystore.jks',
        },
        {
          type: 'input',
          name: 'name',
          message: 'Your name:',
          validate: (input) => input.length > 0 || 'Name is required',
        },
        {
          type: 'input',
          name: 'organization',
          message: 'Organization:',
          default: '',
        },
        {
          type: 'input',
          name: 'city',
          message: 'City:',
          default: '',
        },
        {
          type: 'input',
          name: 'state',
          message: 'State/Province:',
          default: '',
        },
        {
          type: 'input',
          name: 'country',
          message: 'Country code (2 letters):',
          default: 'US',
          validate: (input) => input.length === 2 || 'Must be 2 letters',
        },
      ]);

      // Password prompts (separate to allow validation)
      let password;
      let passwordsMatch = false;

      while (!passwordsMatch) {
        const passwordAnswers = await inquirer.prompt([
          {
            type: 'password',
            name: 'password',
            message: 'Keystore password:',
            mask: '*',
            validate: (input) => input.length >= 6 || 'Password must be at least 6 characters',
          },
          {
            type: 'password',
            name: 'confirmPassword',
            message: 'Confirm password:',
            mask: '*',
          },
        ]);

        if (passwordAnswers.password === passwordAnswers.confirmPassword) {
          password = passwordAnswers.password;
          passwordsMatch = true;
        } else {
          console.log(chalk.red('❌ Passwords do not match. Please try again.\n'));
        }
      }

      answers.password = password;

      // Ensure certs/android directory exists
      const certsDir = path.join(process.cwd(), 'certs', 'android');
      if (!fs.existsSync(certsDir)) {
        console.log(chalk.yellow('\n⚠️  Creating certs/android/ directory...\n'));
        fs.mkdirSync(certsDir, { recursive: true });
      }

      const keystorePath = path.join(certsDir, answers.filename);

      // Check if keystore already exists
      if (fs.existsSync(keystorePath)) {
        const overwrite = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow(`Keystore already exists at ${answers.filename}. Overwrite?`),
            default: false,
          },
        ]);

        if (!overwrite.confirm) {
          console.log(chalk.yellow('\n⚠️  Cancelled\n'));
          return;
        }
      }

      const spinner = ora('Generating keystore...').start();

      try {
        const dname = `CN=${answers.name}${answers.organization ? `, O=${answers.organization}` : ''}${answers.city ? `, L=${answers.city}` : ''}${answers.state ? `, ST=${answers.state}` : ''}, C=${answers.country}`;

        const command = `keytool -genkeypair -v -storetype PKCS12 -keystore ${keystorePath} -alias ${answers.alias} -keyalg RSA -keysize 2048 -validity 10000 -storepass ${answers.password} -keypass ${answers.password} -dname "${dname}"`;

        await runCommand(command);

        spinner.succeed(chalk.green('Keystore generated successfully!'));

        console.log(chalk.cyan('\n📝 Keystore Details:\n'));
        console.log(chalk.gray(`  Location: ${keystorePath}`));
        console.log(chalk.gray(`  Alias: ${answers.alias}`));
        console.log(chalk.gray(`  Type: PKCS12`));
        console.log(chalk.gray(`  Validity: 10000 days (~27 years)`));

        console.log(chalk.cyan('\n📋 Next Steps:\n'));
        console.log(chalk.gray('  1. Keep this keystore file safe and backed up'));
        console.log(chalk.gray('  2. Never commit it to version control'));
        console.log(chalk.gray('  3. Add to android/gradle.properties:'));
        console.log(chalk.yellow(`\n     MYAPP_UPLOAD_STORE_FILE=${answers.filename}`));
        console.log(chalk.yellow(`     MYAPP_UPLOAD_KEY_ALIAS=${answers.alias}`));
        console.log(chalk.yellow(`     MYAPP_UPLOAD_STORE_PASSWORD=${answers.password}`));
        console.log(chalk.yellow(`     MYAPP_UPLOAD_KEY_PASSWORD=${answers.password}\n`));

        console.log(chalk.gray('  4. Update android/app/build.gradle signing config'));
        console.log('');
      } catch (error) {
        spinner.fail(chalk.red('Failed to generate keystore'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  // iOS certificates
  cert
    .command('ios')
    .description('Generate iOS certificate signing request (CSR)')
    .action(async () => {
      console.log(chalk.cyan('\n🍎 Generate iOS Certificate Signing Request\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email address:',
          validate: (input) => input.includes('@') || 'Invalid email',
        },
        {
          type: 'input',
          name: 'name',
          message: 'Common Name (your name or company):',
          validate: (input) => input.length > 0 || 'Name is required',
        },
        {
          type: 'input',
          name: 'filename',
          message: 'Output filename (without extension):',
          default: 'CertificateSigningRequest',
        },
      ]);

      // Ensure certs/ios directory exists
      const certsDir = path.join(process.cwd(), 'certs', 'ios');
      if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
      }

      const keyPath = path.join(certsDir, `${answers.filename}.key`);
      const csrPath = path.join(certsDir, `${answers.filename}.certSigningRequest`);

      const spinner = ora('Generating CSR...').start();

      try {
        // Generate private key
        await runCommand(`openssl genrsa -out ${keyPath} 2048`);

        // Generate CSR
        await runCommand(
          `openssl req -new -key ${keyPath} -out ${csrPath} -subj "/emailAddress=${answers.email}/CN=${answers.name}/C=US"`
        );

        spinner.succeed(chalk.green('CSR generated successfully!'));

        console.log(chalk.cyan('\n📝 Files Created:\n'));
        console.log(chalk.gray(`  Private Key: ${keyPath}`));
        console.log(chalk.gray(`  CSR: ${csrPath}`));

        console.log(chalk.cyan('\n📋 Next Steps:\n'));
        console.log(chalk.gray('  1. Go to Apple Developer Portal'));
        console.log(chalk.gray('     https://developer.apple.com/account/resources/certificates'));
        console.log(chalk.gray('  2. Create a new certificate'));
        console.log(chalk.gray(`  3. Upload the CSR file: ${answers.filename}.certSigningRequest`));
        console.log(chalk.gray('  4. Download the certificate (.cer file)'));
        console.log(chalk.gray('  5. Double-click to install in Keychain Access'));
        console.log(
          chalk.yellow(
            "\n  ⚠️  Keep the .key file safe - you'll need it to export the certificate!\n"
          )
        );
      } catch (error) {
        spinner.fail(chalk.red('Failed to generate CSR'));
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  // Info command
  cert
    .command('info')
    .description('Show certificate information and requirements')
    .action(() => {
      console.log(chalk.cyan('\n📚 Certificate Information\n'));

      console.log(chalk.bold('Android Keystore:'));
      console.log(chalk.gray('  • Required for: Google Play Store uploads'));
      console.log(chalk.gray('  • Format: PKCS12 (.jks)'));
      console.log(chalk.gray('  • Validity: 25+ years recommended'));
      console.log(chalk.gray('  • Tool: keytool (comes with Java JDK)'));
      console.log('');

      console.log(chalk.bold('iOS Certificates:'));
      console.log(chalk.gray('  • Required for: App Store distribution'));
      console.log(chalk.gray('  • Types: Development, Distribution'));
      console.log(chalk.gray('  • Format: .p12 (exported from Keychain)'));
      console.log(chalk.gray('  • Managed via: Apple Developer Portal'));
      console.log('');

      console.log(chalk.bold('Commands:'));
      console.log(chalk.gray('  leaf cert android  - Generate Android keystore'));
      console.log(chalk.gray('  leaf cert ios      - Generate iOS CSR'));
      console.log('');
    });
};
