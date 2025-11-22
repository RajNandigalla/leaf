import fs from 'fs';
import path from 'path';
import { runCommand } from './exec.mjs';
import chalk from 'chalk';

const LEAF_CONFIG_FILE = 'leaf.json';
const LEAF_SCRIPTS_FILE = 'scripts/leaf/scripts.json';
const PACKAGE_JSON_FILE = 'package.json';

export async function installDependencies() {
  // Read leaf deps manifest
  const leafConfig = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), LEAF_CONFIG_FILE), 'utf-8')
  );

  // Read main package.json
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), PACKAGE_JSON_FILE), 'utf-8')
  );

  // Merge dependencies
  const allDeps = {
    ...leafConfig.dependencies,
    ...leafConfig.devDependencies,
  };

  const depsToInstall = [];

  // Check which deps are not already in package.json
  for (const [pkg, version] of Object.entries(allDeps)) {
    const isInDeps = packageJson.dependencies?.[pkg];
    const isInDevDeps = packageJson.devDependencies?.[pkg];

    if (!isInDeps && !isInDevDeps) {
      depsToInstall.push(`${pkg}@${version}`);
    }
  }

  if (depsToInstall.length === 0) {
    return;
  }

  // Install dependencies
  const deps = depsToInstall.filter((d) =>
    Object.keys(leafConfig.dependencies).some((key) => d.startsWith(key))
  );
  const devDeps = depsToInstall.filter((d) =>
    Object.keys(leafConfig.devDependencies).some((key) => d.startsWith(key))
  );

  if (deps.length > 0) {
    await runCommand(`npm install ${deps.join(' ')}`);
  }

  if (devDeps.length > 0) {
    await runCommand(`npm install -D ${devDeps.join(' ')}`);
  }
}

export async function uninstallDependencies() {
  // Read leaf deps manifest
  const leafConfig = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), LEAF_CONFIG_FILE), 'utf-8')
  );

  // Read main package.json
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), PACKAGE_JSON_FILE), 'utf-8')
  );

  const depsToRemove = [];

  // Check which deps are installed
  const allDeps = {
    ...leafConfig.dependencies,
    ...leafConfig.devDependencies,
  };

  for (const pkg of Object.keys(allDeps)) {
    if (packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]) {
      depsToRemove.push(pkg);
    }
  }

  if (depsToRemove.length === 0) {
    return;
  }

  await runCommand(`npm uninstall ${depsToRemove.join(' ')}`);
}

export async function uninstallCommands() {
  // Read leaf scripts manifest
  const leafScripts = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), LEAF_SCRIPTS_FILE), 'utf-8')
  );

  // Read main package.json
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), PACKAGE_JSON_FILE), 'utf-8')
  );

  // Remove scripts
  let removedCount = 0;
  for (const key of Object.keys(leafScripts.scripts)) {
    if (packageJson.scripts?.[key]) {
      delete packageJson.scripts[key];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    fs.writeFileSync(
      path.join(process.cwd(), PACKAGE_JSON_FILE),
      JSON.stringify(packageJson, null, 2) + '\n'
    );
  }
}
