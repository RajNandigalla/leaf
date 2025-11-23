# 🌿 Leaf CLI Documentation

A powerful command-line interface for managing Capacitor mobile app development with Next.js.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
  - [leaf init](#leaf-init)
  - [leaf install](#leaf-install)
  - [leaf lens](#leaf-lens)
  - [leaf setup](#leaf-setup)
  - [leaf status](#leaf-status)
  - [leaf build](#leaf-build)
  - [leaf run](#leaf-run)
  - [leaf sync](#leaf-sync)
  - [leaf plugin](#leaf-plugin)
  - [leaf cert](#leaf-cert)
  - [leaf release](#leaf-release)
  - [leaf clean](#leaf-clean)
  - [leaf info](#leaf-info)
  - [leaf doctor](#leaf-doctor)
  - [leaf uninstall](#leaf-uninstall)
- [Configuration](#configuration)
- [Live Reload Development](#live-reload-development)
- [Production Builds](#production-builds)
- [Troubleshooting](#troubleshooting)

---

## Installation

Leaf CLI is included in your project. No additional installation required.

```bash
npm run leaf --help
# or
yarn leaf --help
```

---

## Quick Start

### 1. Initialize Leaf Configuration

```bash
npm run leaf init
```

Creates `leaf.json` with the latest Capacitor versions.

### 2. Install Capacitor Dependencies

```bash
npm run leaf install
```

Installs all required Capacitor packages.

### 3. Setup Platforms

```bash
npm run leaf setup
```

Initializes Capacitor and adds iOS/Android platforms.

### 4. Run on Device/Simulator

```bash
npm run leaf run android
# or
npm run leaf run ios
```

---

## Commands

### `leaf init`

Generate `leaf.json` configuration file with the latest Capacitor versions.

```bash
npm run leaf init
```

**What it does:**

- Fetches latest versions from npm
- Creates `leaf.json` with core dependencies
- Sets up build scripts
- Configures web directory

**Generated `leaf.json`:**

```json
{
  "name": "capacitor-dependencies",
  "description": "Capacitor and native platform dependencies",
  "version": "1.0.0",
  "scripts": {
    "build": "npm run build:mobile"
  },
  "webDir": "out",
  "dependencies": {
    "@capacitor/core": "^7.x.x",
    "@capacitor/cli": "^7.x.x",
    "@capacitor/app": "^7.x.x"
  },
  "devDependencies": {
    "@capacitor/android": "^7.x.x",
    "@capacitor/ios": "^7.x.x"
  },
  "plugins": {}
}
```

---

### `leaf install`

Install Capacitor dependencies from `leaf.json`.

```bash
npm run leaf install [options]
```

**Options:**

- `--core-only` - Install only core dependencies
- `--platforms-only` - Install only platform dependencies

**What it does:**

- Reads `leaf.json`
- Installs core dependencies (@capacitor/core, @capacitor/cli)
- Installs platform dependencies (@capacitor/android, @capacitor/ios)
- Installs optional plugins

**Example:**

```bash
# Install everything
npm run leaf install

# Install only core packages
npm run leaf install -- --core-only

# Install only platforms
npm run leaf install -- --platforms-only
```

---

### `leaf lens`

Start dev server and generate QR code for Leaf Lens.

```bash
npm run leaf lens [options]
```

**Options:**

- `-p, --port <number>` - Port to run on (default: 3000)

**What it does:**

- Detects your local LAN IP address
- Generates a QR code pointing to your dev server
- Starts the Next.js development server
- Allows you to preview your app using the Leaf Lens mobile app

**Example:**

```bash
# Start on default port (3000)
npm run leaf lens

# Start on custom port
npm run leaf lens -- -p 3001
```

---

### `leaf setup`

Initialize Capacitor and add native platforms.

```bash
npm run leaf setup [options]
```

**Options:**

- `--skip-build` - Skip initial web build

**Interactive prompts:**

1. App name (e.g., "LeafInk")
2. App ID (e.g., "com.leafink.app")
3. Platforms to add (Android/iOS)
4. Build web app first? (Yes/No)

**What it does:**

- Runs `npx cap init` (if not already initialized)
- Builds web app (optional)
- Adds selected platforms
- Syncs web assets

**Smart features:**

- ✅ Skips if already initialized
- ✅ Skips if platforms already exist
- ✅ Detects live reload mode (skips build)

**Example:**

```bash
# Interactive setup
npm run leaf setup

# Skip build step
npm run leaf setup -- --skip-build
```

---

### `leaf status`

Check Capacitor installation and platform status.

```bash
npm run leaf status
```

**Output:**

```
📊 Capacitor Status

✓ Dependencies: Installed
✓ Configuration: Found
✓ iOS: Configured
✓ Android: Configured

✨ Everything looks good!
```

**Status indicators:**

- Dependencies: Installed/Missing
- Configuration: Found/Missing
- Platforms: Configured/Not configured

---

### `leaf build`

Build web app and sync with Capacitor.

```bash
npm run leaf build [options]
```

**Options:**

- `--no-sync` - Skip Capacitor sync

**Interactive prompts:**

1. Build mode (All/Web only/Sync only)

**What it does:**

- Builds web app using `npm run build:mobile`
- Syncs assets to native platforms
- Updates native projects

**Live reload mode:**
If `capacitor.config.ts` has a `server.url`, build is automatically skipped:

```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true
}
```

**Example:**

```bash
# Full build and sync
npm run leaf build

# Build web only (no sync)
npm run leaf build -- --no-sync
```

---

### `leaf run`

Run app on iOS or Android simulator/device.

```bash
npm run leaf run <platform>
```

**Platforms:**

- `android` - Open Android Studio
- `ios` - Open Xcode

**What it does:**

- Opens the native IDE for the selected platform
- You can then run the app from the IDE

**Example:**

```bash
# Open Android Studio
npm run leaf run android

# Open Xcode
npm run leaf run ios
```

---

### `leaf sync`

Sync app with iOS or Android Simulator/Device.

```bash
npm run leaf sync [platform]
```

**Platforms:**

- `android` - Sync Android project
- `ios` - Sync iOS project

**What it does:**

- Runs `npx cap sync` for the selected platform(s)
- Updates native projects with latest web assets and plugins

**Interactive mode:**
If no platform specified, allows you to select platforms to sync.

**Example:**

```bash
# Interactive selection
npm run leaf sync

# Sync specific platform
npm run leaf sync ios
```

---

### `leaf plugin`

Manage Capacitor plugins.

```bash
npm run leaf plugin <command>
```

#### `leaf plugin add [plugin]`

Add a Capacitor plugin.

```bash
npm run leaf plugin add [@capacitor/camera]
```

**Interactive mode:**
If no plugin specified, shows popular plugins to choose from.

**What it does:**

- Fetches latest version from npm
- Adds to `leaf.json` plugins section
- Installs via npm
- Updates configuration
- **Suggests syncing** the project after installation

**Example:**

```bash
# Interactive selection
npm run leaf plugin add

# Direct installation
npm run leaf plugin add @capacitor/camera
```

#### `leaf plugin remove [plugin]`

Remove a Capacitor plugin.

```bash
npm run leaf plugin remove [@capacitor/camera]
# or
npm run leaf plugin rm [@capacitor/camera]
```

**Interactive mode:**
Shows installed plugins to choose from.

**What it does:**

- Removes from `leaf.json`
- Uninstalls via npm

#### `leaf plugin list`

List installed plugins.

```bash
npm run leaf plugin list
# or
npm run leaf plugin ls
```

**Output:**

```
📦 Installed Plugins

✓ @capacitor/camera ^6.0.0 (installed)
✗ @capacitor/geolocation ^6.0.0 (not installed)
```

#### `leaf plugin search [query]`

Search for Capacitor plugins on npm.

```bash
npm run leaf plugin search [camera]
```

**Example:**

```bash
# Search for camera plugins
npm run leaf plugin search camera

# Browse all plugins
npm run leaf plugin search
```

---

### `leaf cert`

Generate signing certificates for app distribution.

```bash
npm run leaf cert <command>
```

#### `leaf cert android`

Generate Android keystore for app signing.

```bash
npm run leaf cert android
```

**Interactive prompts:**

1. Keystore alias (default: "upload")
2. Keystore filename (default: "upload-keystore.jks")
3. Your name
4. Organization (optional)
5. City (optional)
6. State/Province (optional)
7. Country code (2 letters)
8. Password (min 6 characters)
9. Confirm password

**What it does:**

- Generates PKCS12 keystore
- Saves to `certs/android/`
- 10,000 day validity (~27 years)
- Shows gradle configuration

**Output:**

```
✔ Keystore generated successfully!

📝 Keystore Details:

  Location: /path/to/certs/android/upload-keystore.jks
  Alias: upload
  Type: PKCS12
  Validity: 10000 days (~27 years)

📋 Next Steps:

  1. Keep this keystore file safe and backed up
  2. Never commit it to version control
  3. Add to android/gradle.properties:

     MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
     MYAPP_UPLOAD_KEY_ALIAS=upload
     MYAPP_UPLOAD_STORE_PASSWORD=YourPassword
     MYAPP_UPLOAD_KEY_PASSWORD=YourPassword

  4. Update android/app/build.gradle signing config
```

#### `leaf cert ios`

Generate iOS Certificate Signing Request (CSR).

```bash
npm run leaf cert ios
```

**Interactive prompts:**

1. Email address
2. Common Name (your name or company)
3. Output filename (default: "CertificateSigningRequest")

**What it does:**

- Generates private key (.key)
- Generates CSR (.certSigningRequest)
- Saves to `certs/ios/`

**Output:**

```
✔ CSR generated successfully!

📝 Files Created:

  Private Key: /path/to/certs/ios/CertificateSigningRequest.key
  CSR: /path/to/certs/ios/CertificateSigningRequest.certSigningRequest

📋 Next Steps:

  1. Go to Apple Developer Portal
     https://developer.apple.com/account/resources/certificates
  2. Create a new certificate
  3. Upload the CSR file: CertificateSigningRequest.certSigningRequest
  4. Download the certificate (.cer file)
  5. Double-click to install in Keychain Access

  ⚠️  Keep the .key file safe - you'll need it to export the certificate!
```

#### `leaf cert info`

Show certificate information and requirements.

```bash
npm run leaf cert info
```

---

### `leaf release`

Build production releases for Android/iOS.

```bash
npm run leaf release <platform>
```

#### `leaf release android`

Build Android release (APK/AAB).

```bash
npm run leaf release android [--aab]
```

**Options:**

- `--aab` - Build Android App Bundle instead of APK

**Interactive prompts:**

1. Build type (APK/AAB)
2. Build web app first? (Yes/No)
3. Bump version number? (Yes/No)
4. Version bump type (Patch/Minor/Major)

**What it does:**

- Bumps version (optional)
- Builds web app with `CAPACITOR_BUILD=true`
- Syncs with Capacitor
- Runs Gradle build (shows full output)
- Detects signed/unsigned APK
- Shows output location and size

**Output:**

```
✅ APK built successfully

📝 Release Details:

  Output: /path/to/android/app/build/outputs/apk/release/app-release.apk
  Size: 12.34 MB
  Signed: Yes

📋 Next Steps:

  1. Test the APK on a device
  2. Distribute via Firebase, TestFlight, or direct download
```

**Unsigned APK warning:**

```
⚠️  Warning: APK is UNSIGNED

  This APK cannot be distributed or installed on most devices.
  To create a signed APK:

  1. Generate a keystore: leaf cert android
  2. Configure signing in android/app/build.gradle
  3. Add keystore credentials to android/gradle.properties
```

**Server URL warning:**
If `capacitor.config` has a `server.url`:

```
⚠️  Warning: Server URL detected in capacitor.config
   URL: http://localhost:3000
   The app will load content from this URL instead of bundled files.
   Make sure this is intentional for your release build.

? Continue with release build? (Y/n)
```

#### `leaf release ios`

Build iOS release archive.

```bash
npm run leaf release ios
```

**Interactive prompts:**

1. Build web app first? (Yes/No)
2. Bump version number? (Yes/No)
3. Version bump type (Patch/Minor/Major)
4. Open Xcode now? (Yes/No)

**What it does:**

- Bumps version (optional)
- Builds web app
- Syncs with Capacitor
- Opens Xcode (optional)
- Shows archiving instructions

**Output:**

```
📝 iOS Release:

  iOS releases must be built from Xcode

📋 Next Steps:

  1. Open Xcode: npx cap open ios
  2. Select "Any iOS Device" as the build target
  3. Product → Archive
  4. Distribute to App Store or export IPA
```

---

### `leaf clean`

Clean build artifacts and caches.

```bash
npm run leaf clean [--all]
```

**Options:**

- `--all` - Clean everything without prompting

**Interactive selection:**

- ✅ Web build output (out/, dist/, .next/)
- ✅ iOS build artifacts (ios/build/)
- ✅ Android build artifacts (android/build/)
- ✅ Node modules cache
- ⚠️ Capacitor generated files (android/, ios/) - Destructive

**What it does:**

- Removes selected build artifacts
- Frees up disk space
- Confirms destructive operations

**Example:**

```bash
# Interactive selection
npm run leaf clean

# Clean everything (except platforms)
npm run leaf clean -- --all
```

---

### `leaf info`

Display project information and configuration.

```bash
npm run leaf info
```

**Output:**

```
📊 Project Information

╭─────────────────────╮
│                     │
│   leaf-ink v0.1.0   │
│                     │
╰─────────────────────╯

Capacitor Configuration:
  Config file: capacitor.config.ts

Platforms:
  ✓ iOS (configured)
  ✓ Android (configured)

Capacitor Dependencies:
  Core: 3 packages
  Platforms: 2 packages
  Plugins: 2 installed

Build Configuration:
  Build command: npm run build:mobile
  Web directory: out

Environment:
  Package Manager: npm
  Node Version: v23.10.0

Installed Plugins:
  ✓ @capacitor/camera ^6.0.0
  ✓ @capacitor/geolocation ^6.0.0
```

---

### `leaf doctor`

Check environment health and dependencies.

```bash
npm run leaf doctor
```

**What it checks:**

- Node.js version
- npm/yarn version
- Capacitor CLI
- Android SDK (for Android development)
- Xcode (for iOS development)
- CocoaPods (for iOS)

**Output:**

```
🔍 Environment Check

✓ Node.js: v23.10.0
✓ npm: 10.9.2
✓ Capacitor CLI: 7.4.4
✓ Android SDK: Installed
✓ Xcode: 15.0
✓ CocoaPods: 1.15.0

✨ All checks passed!
```

---

### `leaf uninstall`

Uninstall Capacitor dependencies.

```bash
npm run leaf uninstall [options]
```

**Options:**

- `--core-only` - Uninstall only core dependencies
- `--platforms-only` - Uninstall only platform dependencies

**What it does:**

- Removes Capacitor packages
- Cleans up configuration
- Confirms before uninstalling

---

## Configuration

### `leaf.json`

Main configuration file for Leaf CLI.

```json
{
  "name": "capacitor-dependencies",
  "description": "Capacitor and native platform dependencies",
  "version": "1.0.0",
  "scripts": {
    "build": "npm run build:mobile"
  },
  "webDir": "out",
  "dependencies": {
    "@capacitor/core": "^7.4.4",
    "@capacitor/cli": "^7.4.4",
    "@capacitor/app": "^7.1.0"
  },
  "devDependencies": {
    "@capacitor/android": "^7.4.4",
    "@capacitor/ios": "^7.4.4"
  },
  "plugins": {
    "@capacitor/camera": "^6.0.0"
  }
}
```

**Fields:**

- `scripts.build` - Command to build web app
- `webDir` - Output directory for web build (default: "out")
- `dependencies` - Core Capacitor packages
- `devDependencies` - Platform-specific packages
- `plugins` - Optional Capacitor plugins

### `capacitor.config.ts`

Capacitor configuration file.

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leafink.app',
  appName: 'LeafInk',
  webDir: 'out',

  // Optional: Live reload for development
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
```

**Fields:**

- `appId` - Unique app identifier (reverse domain)
- `appName` - Display name of the app
- `webDir` - Web assets directory
- `server.url` - (Optional) Live reload server URL

---

## Live Reload Development

For faster development, use live reload instead of building:

### 1. Start Development Server

```bash
npm run dev
```

### 2. Configure Server URL

Update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.leafink.app',
  appName: 'LeafInk',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.100:3000', // Your local IP
    cleartext: true,
  },
};
```

### 3. Sync and Run

```bash
npm run leaf build  # Skips build automatically
npm run leaf run android
```

**Benefits:**

- ✅ Instant hot reload
- ✅ No build step required
- ✅ Faster iteration
- ✅ See changes immediately

**Important:**

- Use your local IP address (not localhost)
- Remove `server.url` before production builds
- Leaf CLI automatically detects and skips builds

---

## Production Builds

### Build Modes

Leaf CLI supports two build modes:

#### 1. Mobile Build (Static Export)

```bash
npm run build:mobile
```

**Features:**

- Static export to `out/` folder
- No i18n (incompatible with static export)
- Optimized for Capacitor
- Sets `CAPACITOR_BUILD=true`

#### 2. Web Build (SSR)

```bash
npm run build
```

**Features:**

- Full Next.js SSR
- i18n support
- API routes
- Middleware
- Deploy to Vercel/Netlify

### Release Workflow

#### Android

1. **Generate Keystore** (first time only)

   ```bash
   npm run leaf cert android
   ```

2. **Configure Signing**
   - Add credentials to `android/gradle.properties`
   - Update `android/app/build.gradle`

3. **Build Release**

   ```bash
   npm run leaf release android
   ```

4. **Distribute**
   - Upload to Google Play Console
   - Or distribute APK directly

#### iOS

1. **Generate CSR** (first time only)

   ```bash
   npm run leaf cert ios
   ```

2. **Get Certificate**
   - Upload CSR to Apple Developer Portal
   - Download and install certificate

3. **Build Release**

   ```bash
   npm run leaf release ios
   ```

4. **Archive in Xcode**
   - Product → Archive
   - Distribute to App Store

---

## Troubleshooting

### Build Fails

**Problem:** Web build fails during `leaf build` or `leaf release`

**Solution:**

```bash
# Check build locally first
npm run build:mobile

# Check for errors
npm run leaf doctor
```

### Platform Not Found

**Problem:** `❌ Android platform not found`

**Solution:**

```bash
# Run setup to add platforms
npm run leaf setup
```

### Unsigned APK

**Problem:** APK is unsigned and can't be installed

**Solution:**

```bash
# Generate keystore
npm run leaf cert android

# Configure signing in android/app/build.gradle
# Add credentials to android/gradle.properties
```

### Live Reload Not Working

**Problem:** App doesn't connect to development server

**Solution:**

1. Use your local IP (not localhost)
2. Ensure device is on same network
3. Check firewall settings
4. Verify `server.url` in `capacitor.config.ts`

### Capacitor Sync Fails

**Problem:** `Command failed: npx cap sync`

**Solution:**

```bash
# Ensure web assets exist
npm run build:mobile

# Check capacitor.config.ts
npm run leaf info

# Reinstall platforms
npm run leaf setup
```

### Version Mismatch

**Problem:** Capacitor version conflicts

**Solution:**

```bash
# Regenerate leaf.json with latest versions
npm run leaf init

# Reinstall dependencies
npm run leaf install
```

---

## Best Practices

### 1. Version Control

**Add to `.gitignore`:**

```
# Capacitor
android/
ios/
out/

# Certificates (IMPORTANT!)
certs/
*.jks
*.keystore
*.p12
*.key
*.certSigningRequest
```

### 2. Security

- ✅ Never commit keystores or certificates
- ✅ Use environment variables for sensitive data
- ✅ Keep backup of keystores in secure location
- ✅ Use different keystores for debug/release

### 3. Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Configure live reload
# Edit capacitor.config.ts with server.url

# 3. Run on device
npm run leaf run android

# 4. Make changes and see them instantly!
```

### 4. Release Workflow

```bash
# 1. Remove server.url from capacitor.config.ts

# 2. Build release
npm run leaf release android

# 3. Test APK thoroughly

# 4. Distribute
```

### 5. Plugin Management

```bash
# Search before installing
npm run leaf plugin search camera

# Add plugin
npm run leaf plugin add @capacitor/camera

# Verify installation
npm run leaf plugin list
```

---

## Support

For issues or questions:

- Check `npm run leaf doctor`
- Review `npm run leaf info`
- Check Capacitor docs: https://capacitorjs.com

---

**Made with 🌿 by Leaf CLI**
