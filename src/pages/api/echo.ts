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
    nodeVersion: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    status: HealthStatus;
  };
  cpu: {
    loadAverage: number[];
    cores: number;
    loadPerCore: number;
    status: HealthStatus;
  };
  warnings: string[];
}

// Thresholds
const MEMORY_WARNING_THRESHOLD = 70; // 70%
const MEMORY_CRITICAL_THRESHOLD = 85; // 85%
const CPU_WARNING_THRESHOLD = 0.7; // 70% per core
const CPU_CRITICAL_THRESHOLD = 0.9; // 90% per core

function getHealthStatus(memoryPercentage: number, cpuLoadPerCore: number): HealthStatus {
  if (memoryPercentage >= MEMORY_CRITICAL_THRESHOLD || cpuLoadPerCore >= CPU_CRITICAL_THRESHOLD) {
    return 'critical';
  }
  if (memoryPercentage >= MEMORY_WARNING_THRESHOLD || cpuLoadPerCore >= CPU_WARNING_THRESHOLD) {
    return 'degraded';
  }
  return 'healthy';
}

function getMemoryStatus(percentage: number): HealthStatus {
  if (percentage >= MEMORY_CRITICAL_THRESHOLD) return 'critical';
  if (percentage >= MEMORY_WARNING_THRESHOLD) return 'degraded';
  return 'healthy';
}

function getCpuStatus(loadPerCore: number): HealthStatus {
  if (loadPerCore >= CPU_CRITICAL_THRESHOLD) return 'critical';
  if (loadPerCore >= CPU_WARNING_THRESHOLD) return 'degraded';
  return 'healthy';
}

export default function echo(req: NextApiRequest, res: NextApiResponse<EchoResponse>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  // Get memory usage
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const usedMem = memUsage.heapUsed;
  const memoryPercentage = Math.round((usedMem / totalMem) * 100);

  // Get CPU load
  const loadAvg = os.loadavg(); // [1min, 5min, 15min]
  const cpuCount = os.cpus().length;
  const loadPerCore = loadAvg[0] / cpuCount; // 1-minute load average per core

  // Determine health status
  const overallStatus = getHealthStatus(memoryPercentage, loadPerCore);
  const memoryStatus = getMemoryStatus(memoryPercentage);
  const cpuStatus = getCpuStatus(loadPerCore);

  // Build warnings array
  const warnings: string[] = [];
  if (memoryStatus === 'critical') {
    warnings.push(
      `🔴 CRITICAL: Memory usage at ${memoryPercentage}% (threshold: ${MEMORY_CRITICAL_THRESHOLD}%)`
    );
  } else if (memoryStatus === 'degraded') {
    warnings.push(
      `⚠️ WARNING: Memory usage at ${memoryPercentage}% (threshold: ${MEMORY_WARNING_THRESHOLD}%)`
    );
  }

  if (cpuStatus === 'critical') {
    warnings.push(
      `🔴 CRITICAL: CPU load at ${(loadPerCore * 100).toFixed(1)}% per core (threshold: ${CPU_CRITICAL_THRESHOLD * 100}%)`
    );
  } else if (cpuStatus === 'degraded') {
    warnings.push(
      `⚠️ WARNING: CPU load at ${(loadPerCore * 100).toFixed(1)}% per core (threshold: ${CPU_WARNING_THRESHOLD * 100}%)`
    );
  }

  const response: EchoResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    instance: {
      hostname: os.hostname(),
      pid: process.pid,
      platform: os.platform(),
      nodeVersion: process.version,
    },
    memory: {
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: memoryPercentage,
      status: memoryStatus,
    },
    cpu: {
      loadAverage: loadAvg.map((load) => Math.round(load * 100) / 100),
      cores: cpuCount,
      loadPerCore: Math.round(loadPerCore * 100) / 100,
      status: cpuStatus,
    },
    warnings,
  };

  // Return appropriate HTTP status code based on health
  const httpStatus = overallStatus === 'critical' ? 503 : 200;
  res.status(httpStatus).json(response);
}
