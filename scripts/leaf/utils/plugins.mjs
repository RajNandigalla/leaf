import fs from 'fs';
import path from 'path';
import { runCommand } from './exec.mjs';

const LEAF_CONFIG_FILE = 'leaf.json';
const PACKAGE_JSON_FILE = 'package.json';

/**
 * Get all installed plugins from leaf.json and package.json
 */
export function getInstalledPlugins() {
  const leafConfig = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), LEAF_CONFIG_FILE), 'utf-8')
  );
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), PACKAGE_JSON_FILE), 'utf-8')
  );

  const plugins = leafConfig.plugins || {};
  const installed = [];

  for (const [name, version] of Object.entries(plugins)) {
    const isInstalled = packageJson.dependencies?.[name] || packageJson.devDependencies?.[name];

    installed.push({
      name,
      version,
      installed: !!isInstalled,
      installedVersion: isInstalled || null,
    });
  }

  return installed;
}

/**
 * Add a plugin to leaf.json
 */
export function addPluginToConfig(pluginName, version) {
  const configPath = path.join(process.cwd(), LEAF_CONFIG_FILE);
  const leafConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  if (!leafConfig.plugins) {
    leafConfig.plugins = {};
  }

  leafConfig.plugins[pluginName] = version;

  fs.writeFileSync(configPath, JSON.stringify(leafConfig, null, 4));
}

/**
 * Remove a plugin from leaf.json
 */
export function removePluginFromConfig(pluginName) {
  const configPath = path.join(process.cwd(), LEAF_CONFIG_FILE);
  const leafConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  if (leafConfig.plugins && leafConfig.plugins[pluginName]) {
    delete leafConfig.plugins[pluginName];
    fs.writeFileSync(configPath, JSON.stringify(leafConfig, null, 4));
    return true;
  }

  return false;
}

/**
 * Get plugin info from npm registry
 */
export async function getPluginInfo(pluginName) {
  try {
    const info = await runCommand(`npm view ${pluginName} --json`);
    return JSON.parse(info);
  } catch (error) {
    return null;
  }
}

/**
 * Search for Capacitor plugins on npm
 */
export async function searchPlugins(query = '') {
  try {
    // Search for @capacitor/* packages
    const searchTerm = query ? `@capacitor/${query}` : '@capacitor/';

    const result = await runCommand(`npm search ${searchTerm} --json`);
    const packages = JSON.parse(result);

    // Filter to only include official Capacitor plugins
    return packages
      .filter((pkg) => pkg.name.startsWith('@capacitor/'))
      .filter(
        (pkg) =>
          !['@capacitor/core', '@capacitor/cli', '@capacitor/ios', '@capacitor/android'].includes(
            pkg.name
          )
      )
      .map((pkg) => ({
        name: pkg.name,
        description: pkg.description || 'No description',
        version: pkg.version,
      }));
  } catch (error) {
    return [];
  }
}

/**
 * Get list of popular Capacitor plugins
 */
export function getPopularPlugins() {
  return [
    '@capacitor/camera',
    '@capacitor/filesystem',
    '@capacitor/geolocation',
    '@capacitor/network',
    '@capacitor/storage',
    '@capacitor/preferences',
    '@capacitor/share',
    '@capacitor/haptics',
    '@capacitor/status-bar',
    '@capacitor/splash-screen',
    '@capacitor/push-notifications',
    '@capacitor/local-notifications',
    '@capacitor/device',
    '@capacitor/app',
    '@capacitor/keyboard',
    '@capacitor/toast',
  ];
}
