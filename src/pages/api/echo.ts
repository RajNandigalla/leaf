import { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';

type HealthStatus = 'healthy' | 'degraded' | 'critical';

interface EchoResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  instance: {
    hostname: string;
    pid: number;
    platform: string;
    node: string;
    cpus: number;
  };
  memory: {
    system: {
      total: string;
      free: string;
      usedPercent: string;
    };
    process: {
      rss: string;
      heapUsed: string;
      rssPercent: string; // Process impact on total RAM
    };
    status: HealthStatus;
  };
  cpu: {
    loadAverage: number[];
    loadPerCore: number;
    loadPerCorePercent: string;
    status: HealthStatus;
  };
  warnings: string[];
}

// Thresholds
const MEMORY_WARNING_THRESHOLD = 75; // 75% System RAM Used
const MEMORY_CRITICAL_THRESHOLD = 90; // 90% System RAM Used
const CPU_WARNING_THRESHOLD = 0.7; // Load avg 0.7 per core
const CPU_CRITICAL_THRESHOLD = 0.9; // Load avg 0.9 per core

function getHealthStatus(memPercent: number, cpuLoad: number): HealthStatus {
  if (memPercent >= MEMORY_CRITICAL_THRESHOLD || cpuLoad >= CPU_CRITICAL_THRESHOLD) {
    return 'critical';
  }
  if (memPercent >= MEMORY_WARNING_THRESHOLD || cpuLoad >= CPU_WARNING_THRESHOLD) {
    return 'degraded';
  }
  return 'healthy';
}

export default function echo(req: NextApiRequest, res: NextApiResponse<EchoResponse>) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  // --- 1. CPU Calculation ---
  // Polyfill for Node < 19
  const cpuCount = os.availableParallelism ? os.availableParallelism() : os.cpus().length;

  // os.loadavg() works on Linux/macOS. On Windows it returns [0,0,0].
  const loadAvg = os.loadavg();

  // Normalized load for health check (1 min avg / cores)
  const loadPerCore = loadAvg[0] / cpuCount;
  const loadPerCorePercent = +(loadPerCore * 100).toFixed(1);

  // --- 2. Memory Calculation ---
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const systemUsedMem = totalMem - freeMem;
  const systemMemPercent = +((systemUsedMem / totalMem) * 100).toFixed(1);

  // Process specific memory (What you asked for earlier)
  const processMem = process.memoryUsage();
  const processRssPercent = +((processMem.rss / totalMem) * 100).toFixed(2);

  // --- 3. Determine Status ---
  // We base health on SYSTEM memory, not just process memory
  const overallStatus = getHealthStatus(systemMemPercent, loadPerCore);

  let memoryStatus: HealthStatus = 'healthy';
  if (systemMemPercent >= MEMORY_CRITICAL_THRESHOLD) memoryStatus = 'critical';
  else if (systemMemPercent >= MEMORY_WARNING_THRESHOLD) memoryStatus = 'degraded';

  let cpuStatus: HealthStatus = 'healthy';
  if (loadPerCore >= CPU_CRITICAL_THRESHOLD) cpuStatus = 'critical';
  else if (loadPerCore >= CPU_WARNING_THRESHOLD) cpuStatus = 'degraded';

  // --- 4. Warnings ---
  const warnings: string[] = [];
  if (memoryStatus !== 'healthy') {
    warnings.push(
      `Memory: System usage at ${systemMemPercent}% (Threshold: ${memoryStatus === 'critical' ? MEMORY_CRITICAL_THRESHOLD : MEMORY_WARNING_THRESHOLD}%)`
    );
  }
  if (cpuStatus !== 'healthy') {
    warnings.push(
      `CPU: Load avg per core ${loadPerCore.toFixed(2)} (Threshold: ${cpuStatus === 'critical' ? CPU_CRITICAL_THRESHOLD : CPU_WARNING_THRESHOLD})`
    );
  }

  // --- 5. Response ---
  const response: EchoResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.0.0',
    environment: process.env.NODE_ENV || 'development',
    instance: {
      hostname: os.hostname(),
      pid: process.pid,
      platform: os.platform(),
      node: process.version,
      cpus: cpuCount,
    },
    memory: {
      system: {
        total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        usedPercent: systemMemPercent + '%',
      },
      process: {
        rss: (processMem.rss / 1024 / 1024).toFixed(2) + ' MB', // Physical RAM
        heapUsed: (processMem.heapUsed / 1024 / 1024).toFixed(2) + ' MB', // JS Objects
        rssPercent: processRssPercent + '%',
      },
      status: memoryStatus,
    },
    cpu: {
      loadAverage: loadAvg.map((load) => +load.toFixed(2)),
      loadPerCore: +loadPerCore.toFixed(2),
      loadPerCorePercent: loadPerCorePercent + ' %',
      status: cpuStatus,
    },
    warnings,
  };

  // Return appropriate HTTP status code based on health
  const httpStatus = overallStatus === 'critical' ? 503 : 200;
  res.status(httpStatus).json(response);
}
