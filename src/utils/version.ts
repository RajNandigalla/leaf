import packageJson from '../../package.json';
import { env } from './env';

export interface VersionInfo {
  version: string;
  environment: string;
  buildTime: string;
  buildTimestamp: number;
}

export function getVersionInfo(): VersionInfo {
  const buildTimestamp = Date.now();
  const buildTime = new Date(buildTimestamp).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  });

  return {
    version: packageJson.version,
    environment: env('NODE_ENV') || 'development',
    buildTime,
    buildTimestamp,
  };
}

export function logVersion(): void {
  const info = getVersionInfo();
  const env = info.environment === 'production' ? 'prod' : 'dev';

  console.log(
    `%cLeafInk v${info.version} (${env}) built on ${info.buildTime} (${info.buildTimestamp})`,
    'color: #2563eb;'
  );
}
