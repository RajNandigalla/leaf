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
          // or: export default { ... };
          const match =
            content.match(/const\s+\w+\s*:\s*CapacitorConfig\s*=\s*(\{[\s\S]*?\});/) ||
            content.match(/export\s+default\s+(\{[\s\S]*?\});/);

          if (match) {
            try {
              // Extract the config object string
              let configStr = match[1];

              // Remove TypeScript type annotations
              configStr = configStr
                .replace(/:\s*\w+(\[\])?(?=\s*[,}])/g, '') // Remove type annotations
                .replace(/as\s+\w+/g, ''); // Remove 'as Type'

              // Safely evaluate the object
              // Use JSON.parse for safety, but handle unquoted keys
              const jsonStr = configStr
                .replace(/(\w+):/g, '"$1":') // Quote keys
                .replace(/'/g, '"'); // Convert single quotes to double

              return JSON.parse(jsonStr);
            } catch (error) {
              // If JSON parsing fails, try Function constructor as fallback
              try {
                return new Function(`return ${match[1]}`)();
              } catch (e) {
                console.error('Failed to parse Capacitor config:', e);
                return null;
              }
            }
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
