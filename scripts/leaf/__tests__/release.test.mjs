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
let releaseCommand;

describe('leaf release', () => {
  let program;
  let androidCommand;
  let iosCommand;
  let androidAction;
  let iosAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/release.mjs');
    releaseCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

    // Mock program object structure
    const createMockCommand = (name) => ({
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn(function (cb) {
        if (name === 'android') androidAction = cb;
        if (name === 'ios') iosAction = cb;
        return this;
      }),
    });

    androidCommand = createMockCommand('android');
    iosCommand = createMockCommand('ios');

    program = {
      command: jest.fn((name) => {
        if (name === 'release') {
          return {
            description: jest.fn().mockReturnThis(),
            command: jest.fn((subName) => {
              if (subName === 'android') return androidCommand;
              if (subName === 'ios') return iosCommand;
              return createMockCommand(subName);
            }),
          };
        }
        return createMockCommand(name);
      }),
    };

    // Default mock implementations
    mockFs.existsSync.mockReturnValue(true);
    mockCapacitor.shouldSkipBuild.mockReturnValue(false);
    mockCapacitor.getServerUrl.mockReturnValue(null);
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        scripts: { build: 'npm run build' },
        webDir: 'out',
      })
    );
    mockFs.statSync.mockReturnValue({ size: 1024 * 1024 * 10 }); // 10MB
  });

  it('should register release commands', () => {
    releaseCommand(program);
    expect(program.command).toHaveBeenCalledWith('release');
  });

  describe('android', () => {
    it('should fail if android platform missing', async () => {
      releaseCommand(program);
      mockFs.existsSync.mockReturnValue(false);

      await androidAction({});

      expect(mockExec.runCommand).not.toHaveBeenCalled();
    });

    it('should build APK by default', async () => {
      releaseCommand(program);

      mockInquirer.prompt.mockResolvedValueOnce({
        buildType: 'apk',
        buildWeb: true,
        bumpVersion: false,
      });

      await androidAction({});

      expect(mockExec.runCommand).toHaveBeenCalledWith('npm run build');
      expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap sync android');
      // Gradle command is run via child_process.execSync which we need to mock if we want to verify it
    });

    it('should bump version if requested', async () => {
      releaseCommand(program);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          buildType: 'apk',
          buildWeb: false,
          bumpVersion: true,
        })
        .mockResolvedValueOnce({
          versionType: 'patch',
        });

      await androidAction({});

      expect(mockExec.runCommand).toHaveBeenCalledWith('npm version patch --no-git-tag-version');
    });
  });

  describe('ios', () => {
    it('should fail if ios platform missing', async () => {
      releaseCommand(program);
      mockFs.existsSync.mockReturnValue(false);

      await iosAction({});

      expect(mockExec.runCommand).not.toHaveBeenCalled();
    });

    it('should build web and sync', async () => {
      releaseCommand(program);

      mockInquirer.prompt.mockResolvedValueOnce({
        buildWeb: true,
        bumpVersion: false,
      });

      mockInquirer.prompt.mockResolvedValueOnce({
        open: false,
      });

      await iosAction({});

      expect(mockExec.runCommand).toHaveBeenCalledWith('npm run build');
      expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap sync ios');
    });

    it('should open Xcode if requested', async () => {
      releaseCommand(program);

      mockInquirer.prompt.mockResolvedValueOnce({
        buildWeb: false,
        bumpVersion: false,
      });

      mockInquirer.prompt.mockResolvedValueOnce({
        open: true,
      });

      await iosAction({});

      expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap open ios');
    });
  });
});
