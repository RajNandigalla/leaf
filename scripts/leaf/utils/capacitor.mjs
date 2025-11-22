import { cosmiconfigSync } from 'cosmiconfig';

/**
 * Load Capacitor configuration using cosmiconfig
 * Supports .ts, .js, .json, and more
 */
function loadCapacitorConfig() {
  try {
    const explorer = cosmiconfigSync('capacitor', {
      searchPlaces: ['capacitor.config.ts', 'capacitor.config.js', 'capacitor.config.json'],
      loaders: {
        '.ts': (filepath, content) => {
          // Simple TS parsing - extract the config object
          // Match: const anyName: CapacitorConfig = { ... };
          // or: const anyName = { ... }; (if exported as default)
          const match =
            content.match(/const\s+\w+\s*:\s*CapacitorConfig\s*=\s*(\{[\s\S]*?\});/) ||
            content.match(/export\s+default\s+(\{[\s\S]*?\});/);

          if (match) {
            // Remove TypeScript types and evaluate as JS
            const configStr = match[1]
              .replace(/as\s+\w+/g, '') // Remove 'as Type'
              .replace(/:\s*\w+(\[\])?/g, ''); // Remove type annotations

            // Use Function constructor to safely evaluate
            return new Function(`return ${configStr}`)();
          }
          return null;
        },
      },
    });

    const result = explorer.search();
    return result ? result.config : null;
  } catch (error) {
    console.error('Error loading Capacitor config:', error);
    return null;
  }
}

/**
 * Check if Capacitor is configured with a server URL
 * If server.url is present, we're using live reload and don't need to build
 */
export function shouldSkipBuild() {
  const config = loadCapacitorConfig();
  return config && config.server && config.server.url;
}

/**
 * Get the server URL from capacitor config if present
 */
export function getServerUrl() {
  const config = loadCapacitorConfig();
  return config?.server?.url || null;
}
