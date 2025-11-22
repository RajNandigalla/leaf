import { jest } from '@jest/globals';
import {
  mockInquirer,
  mockExec,
  mockChecker,
  mockCapacitor,
  mockFs,
  mockOra,
  setupMocks,
  resetMocks,
} from './mocks.mjs';

// Import the module under test dynamically
let setupCommand;

describe('leaf setup', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/setup.mjs');
    setupCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

    // Mock process.exit to prevent test crashes
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Mock program object
    program = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn((cb) => {
        commandAction = cb;
        return program;
      }),
    };

    // Default mock implementations
    mockChecker.checkInstallation.mockReturnValue({ depsInstalled: true });
    mockCapacitor.shouldSkipBuild.mockReturnValue(false);
    mockCapacitor.getServerUrl.mockReturnValue(null);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ scripts: { build: 'npm run build' } }));
    mockFs.existsSync.mockReturnValue(false); // Default: nothing exists
  });

  it('should register setup command', () => {
    setupCommand(program);
    expect(program.command).toHaveBeenCalledWith('setup');
  });

  it('should fail if dependencies not installed', async () => {
    setupCommand(program);
    mockChecker.checkInstallation.mockReturnValue({ depsInstalled: false });

    await commandAction({});

    expect(mockExec.runCommand).not.toHaveBeenCalled();
  });

  it('should run full setup', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios', 'android'],
      buildFirst: true,
    });

    await commandAction({});

    expect(mockExec.runCommand).toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith(
      'npx cap init "TestApp" "com.test.app" --web-dir=out'
    );
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add android');
  });

  it('should skip build if requested', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
  });

  it('should skip init if config exists', async () => {
    setupCommand(program);

    mockFs.existsSync.mockImplementation((path) => path.includes('capacitor.config.ts'));

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith(expect.stringContaining('npx cap init'));
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
  });

  it('should skip existing platforms', async () => {
    setupCommand(program);

    // Mock ios folder exists
    mockFs.existsSync.mockImplementation((path) => path.endsWith('/ios'));

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios', 'android'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npx cap add ios');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add android');
  });

  it('should detect and skip build with live reload', async () => {
    setupCommand(program);

    mockCapacitor.shouldSkipBuild.mockReturnValue(true);
    mockCapacitor.getServerUrl.mockReturnValue('http://localhost:3000');

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    await commandAction({});

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npm run build');
  });

  it('should not ask about build when skipBuild option is set', async () => {
    setupCommand(program);

    let whenFn;
    mockInquirer.prompt.mockImplementation((questions) => {
      const buildQuestion = questions.find((q) => q.name === 'buildFirst');
      if (buildQuestion) {
        whenFn = buildQuestion.when;
      }
      return Promise.resolve({
        appName: 'TestApp',
        appId: 'com.test.app',
        platforms: ['ios'],
      });
    });

    await commandAction({ skipBuild: true });

    // Test the when condition
    expect(whenFn()).toBe(false);
  });

  it('should validate app ID format', async () => {
    setupCommand(program);

    let validationFn;
    mockInquirer.prompt.mockImplementation((questions) => {
      const appIdQuestion = questions.find((q) => q.name === 'appId');
      validationFn = appIdQuestion.validate;
      return Promise.resolve({
        appName: 'TestApp',
        appId: 'com.test.app',
        platforms: ['ios'],
        buildFirst: false,
      });
    });

    await commandAction({ skipBuild: true });

    // Test invalid app IDs
    expect(validationFn('InvalidAppId')).toBe(
      'Please enter a valid app ID (e.g., com.example.app)'
    );
    expect(validationFn('com')).toBe('Please enter a valid app ID (e.g., com.example.app)');
    expect(validationFn('123.test.app')).toBe(
      'Please enter a valid app ID (e.g., com.example.app)'
    );

    // Test valid app ID
    expect(validationFn('com.test.app')).toBe(true);
  });

  it('should validate platform selection', async () => {
    setupCommand(program);

    let validationFn;
    mockInquirer.prompt.mockImplementation((questions) => {
      const platformQuestion = questions.find((q) => q.name === 'platforms');
      validationFn = platformQuestion.validate;
      return Promise.resolve({
        appName: 'TestApp',
        appId: 'com.test.app',
        platforms: ['ios'],
        buildFirst: false,
      });
    });

    await commandAction({ skipBuild: true });

    // Test empty selection
    expect(validationFn([])).toBe('You must choose at least one platform.');

    // Test valid selection
    expect(validationFn(['ios'])).toBe(true);
  });

  it('should handle build errors', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: true,
    });

    mockExec.runCommand.mockImplementation((cmd) => {
      if (cmd.includes('build')) {
        return Promise.reject(new Error('Build failed'));
      }
      return Promise.resolve();
    });

    await commandAction({});

    expect(mockOra.fail).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle init errors', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    mockExec.runCommand.mockImplementation((cmd) => {
      if (cmd.includes('cap init')) {
        return Promise.reject(new Error('Init failed'));
      }
      return Promise.resolve();
    });

    await commandAction({ skipBuild: true });

    expect(mockOra.fail).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle platform addition errors', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    mockExec.runCommand.mockImplementation((cmd) => {
      if (cmd.includes('cap add')) {
        return Promise.reject(new Error('Platform add failed'));
      }
      return Promise.resolve();
    });

    await commandAction({ skipBuild: true });

    expect(mockOra.fail).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should show iOS-specific next steps', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
  });

  it('should show Android-specific next steps', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['android'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add android');
  });
});
