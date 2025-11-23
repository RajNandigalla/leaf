import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { internalIpV4 } from 'internal-ip';
import { spawn } from 'child_process';

export default (program) => {
  program
    .command('lens')
    .description('Start dev server and generate QR code for Leaf Lens')
    .option('-p, --port <number>', 'Port to run on', '3000')
    .action(async (options) => {
      console.log(chalk.cyan('\n🔍 Leaf Lens\n'));

      try {
        const ip = await internalIpV4();

        if (!ip) {
          console.log(chalk.red('❌ Could not detect local IP address.'));
          console.log(chalk.gray('Make sure you are connected to a network.\n'));
          return;
        }

        const port = options.port;
        const url = `http://${ip}:${port}`;

        console.log(chalk.gray('Local IP:'), chalk.bold(ip));
        console.log(chalk.gray('URL:'), chalk.bold(url));
        console.log('');

        // Generate QR Code
        qrcode.generate(url, { small: true }, (qrcode) => {
          console.log(qrcode);
        });

        console.log(chalk.yellow('\nScan this QR code with the Leaf Lens app to preview.\n'));

        // Start dev server
        console.log(chalk.gray('Starting dev server...'));

        // Read dev command from leaf.json or fallback
        const fs = await import('fs');
        const path = await import('path');
        let devCommand = 'npm run dev';

        try {
          const leafConfigPath = path.join(process.cwd(), 'leaf.json');
          if (fs.existsSync(leafConfigPath)) {
            const leafConfig = JSON.parse(fs.readFileSync(leafConfigPath, 'utf-8'));
            if (leafConfig.scripts && leafConfig.scripts.dev) {
              devCommand = leafConfig.scripts.dev;
            }
          }
        } catch (e) {
          // Ignore error, use fallback
        }

        console.log(chalk.gray(`Running: ${devCommand}`));

        const [cmd, ...cmdArgs] = devCommand.split(' ');

        // If port is specified and not default, try to append it
        // This is tricky because different tools handle ports differently
        // For now, we'll just run the command as is, and assume the user configured it
        // or if it's the default 'npm run dev', we append the port if needed

        if (port !== '3000' && devCommand === 'npm run dev') {
          cmdArgs.push('--');
          cmdArgs.push('-p');
          cmdArgs.push(port);
        }

        const child = spawn(cmd, cmdArgs, { stdio: 'inherit' });

        child.on('close', (code) => {
          if (code !== 0) {
            console.log(chalk.red(`\n❌ Dev server exited with code ${code}\n`));
          }
        });
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
      }
    });
};
