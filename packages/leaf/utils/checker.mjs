import fs from 'fs';
import path from 'path';

export function checkInstallation() {
  const leafConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8'));

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );

  // Check dependencies
  const allDeps = {
    ...leafConfig.dependencies,
    ...leafConfig.devDependencies,
  };

  const installedDeps = Object.keys(allDeps).filter(
    (pkg) => packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
  );

  const depsInstalled = installedDeps.length === Object.keys(allDeps).length;

  // Check platforms
  const platforms = {
    ios: fs.existsSync(path.join(process.cwd(), 'ios')),
    android: fs.existsSync(path.join(process.cwd(), 'android')),
  };

  // Check capacitor config
  const configExists =
    fs.existsSync(path.join(process.cwd(), 'capacitor.config.ts')) ||
    fs.existsSync(path.join(process.cwd(), 'capacitor.config.json')) ||
    fs.existsSync(path.join(process.cwd(), 'capacitor.config.js'));

  return {
    depsInstalled,
    configExists,
    isFullyInstalled: depsInstalled && configExists,
    installedDeps: installedDeps.length,
    totalDeps: Object.keys(allDeps).length,
    platforms,
  };
}
