import { jest } from '@jest/globals';

export const mockInquirer = {
  prompt: jest.fn(),
};

export const mockOra = {
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  info: jest.fn().mockReturnThis(),
};

export const mockExec = {
  runCommand: jest.fn(),
};

export const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  statSync: jest.fn(),
};

export const mockChildProcess = {
  execSync: jest.fn(),
  spawn: jest.fn(),
};

export const mockChecker = {
  checkInstallation: jest.fn(),
};

export const mockCapacitor = {
  shouldSkipBuild: jest.fn(),
  getServerUrl: jest.fn(),
};

export const mockOraFn = jest.fn(() => mockOra);

export const setupMocks = async () => {
  jest.unstable_mockModule('inquirer', () => ({
    default: mockInquirer,
  }));

  jest.unstable_mockModule('ora', () => ({
    default: mockOraFn,
  }));

  jest.unstable_mockModule('../utils/exec.mjs', () => mockExec);
  jest.unstable_mockModule('../utils/checker.mjs', () => mockChecker);
  jest.unstable_mockModule('../utils/capacitor.mjs', () => mockCapacitor);
  jest.unstable_mockModule('../utils/plugins.mjs', () => mockPluginsUtils);
  jest.unstable_mockModule('../utils/installer.mjs', () => mockInstaller);

  // Mock fs globally for readFileSync
  jest.unstable_mockModule('fs', () => ({
    default: mockFs,
    readFileSync: mockFs.readFileSync,
    existsSync: mockFs.existsSync,
    writeFileSync: mockFs.writeFileSync,
    mkdirSync: mockFs.mkdirSync,
    statSync: mockFs.statSync,
  }));

  jest.unstable_mockModule('child_process', () => ({
    default: mockChildProcess,
    execSync: mockChildProcess.execSync,
    spawn: mockChildProcess.spawn,
  }));
};

export const mockPluginsUtils = {
  getInstalledPlugins: jest.fn(),
  addPluginToConfig: jest.fn(),
  removePluginFromConfig: jest.fn(),
  getPluginInfo: jest.fn(),
  searchPlugins: jest.fn(),
  getPopularPlugins: jest.fn(),
};

export const mockInstaller = {
  installDependencies: jest.fn(),
  uninstallDependencies: jest.fn(),
  uninstallCommands: jest.fn(),
};

export const resetMocks = () => {
  jest.resetAllMocks();
  // Restore default implementations
  mockOraFn.mockReturnValue(mockOra);
  mockOra.start.mockReturnThis();
  mockOra.succeed.mockReturnThis();
  mockOra.fail.mockReturnThis();
  mockOra.stop.mockReturnThis();
  mockOra.info.mockReturnThis();
};
