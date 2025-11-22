import { jest } from '@jest/globals';

// Mock dependencies
const mockFs = {
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
};

const mockRunCommand = jest.fn();

jest.unstable_mockModule('fs', () => ({
  default: mockFs,
  readFileSync: mockFs.readFileSync,
  writeFileSync: mockFs.writeFileSync,
}));

jest.unstable_mockModule('../../utils/exec.mjs', () => ({
  runCommand: mockRunCommand,
}));

// Import after mocking
const { installDependencies, uninstallDependencies, uninstallCommands } = await import(
  '../../utils/installer.mjs'
);

describe('installer utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('installDependencies', () => {
    it('should install missing dependencies', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: { '@capacitor/cli': '^6.0.0' },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: {},
            devDependencies: {},
          });
        }
      });

      await installDependencies();

      expect(mockRunCommand).toHaveBeenCalledWith('npm install @capacitor/core@^6.0.0');
      expect(mockRunCommand).toHaveBeenCalledWith('npm install -D @capacitor/cli@^6.0.0');
    });

    it('should skip already installed dependencies', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: {},
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: {},
          });
        }
      });

      await installDependencies();

      expect(mockRunCommand).not.toHaveBeenCalled();
    });
  });

  describe('uninstallDependencies', () => {
    it('should uninstall all leaf dependencies', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: { '@capacitor/cli': '^6.0.0' },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: { '@capacitor/cli': '^6.0.0' },
          });
        }
      });

      await uninstallDependencies();

      expect(mockRunCommand).toHaveBeenCalledWith(
        expect.stringContaining('npm uninstall @capacitor/core @capacitor/cli')
      );
    });

    it('should skip if no dependencies installed', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: {},
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: {},
            devDependencies: {},
          });
        }
      });

      await uninstallDependencies();

      expect(mockRunCommand).not.toHaveBeenCalled();
    });
  });

  describe('uninstallCommands', () => {
    it('should remove scripts from package.json', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('scripts.json')) {
          return JSON.stringify({
            scripts: {
              'dev:ios': 'npx cap run ios',
              'dev:android': 'npx cap run android',
            },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            scripts: {
              'dev:ios': 'npx cap run ios',
              'dev:android': 'npx cap run android',
              build: 'next build',
            },
          });
        }
      });

      await uninstallCommands();

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
      expect(writtenContent.scripts['dev:ios']).toBeUndefined();
      expect(writtenContent.scripts['dev:android']).toBeUndefined();
      expect(writtenContent.scripts.build).toBe('next build');
    });

    it('should skip if no scripts to remove', async () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('scripts.json')) {
          return JSON.stringify({
            scripts: {
              'dev:ios': 'npx cap run ios',
            },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            scripts: {
              build: 'next build',
            },
          });
        }
      });

      await uninstallCommands();

      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});
