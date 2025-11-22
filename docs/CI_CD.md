# CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for LeafInk using GitHub Actions.

## Overview

Our CI/CD pipeline automatically runs quality checks on every pull request and push to main branches, ensuring code quality and preventing regressions.

## Initial Setup

> [!IMPORTANT]
> Follow these steps to activate the CI/CD pipeline for the first time.

### Step 1: Update README Badge URLs

In `README.md`, replace `YOUR_USERNAME` with your actual GitHub username:

```markdown
# Before

[![CI](https://github.com/YOUR_USERNAME/leaf-ink/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/leaf-ink/actions/workflows/ci.yml)

# After (replace with your username)

[![CI](https://github.com/rajnandigalla/leaf-ink/actions/workflows/ci.yml/badge.svg)](https://github.com/rajnandigalla/leaf-ink/actions/workflows/ci.yml)
```

Update both badges (CI and E2E Tests).

### Step 2: Push to GitHub

Commit and push the workflow files:

```bash
git add .github/
git add README.md
git add docs/CI_CD.md
git commit -m "ci: add GitHub Actions workflows and Dependabot"
git push origin main
```

### Step 3: Verify Workflows

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see workflows running automatically
4. Check that the badges in README show the correct status

### Optional: Add Code Coverage (Codecov)

If you want code coverage reports:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Get your upload token
4. Add it to GitHub repository secrets:
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Name: `CODECOV_TOKEN`
   - Value: Your token from Codecov

That's it! The workflows will now run automatically on every push and PR.

## Workflows

### 🔍 CI Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

**Jobs:**

1. **Lint & Type Check**
   - Runs ESLint to check code quality
   - Runs TypeScript compiler to verify types
   - Ensures code follows project standards

2. **Unit Tests**
   - Runs Jest test suite
   - Generates code coverage reports
   - Uploads coverage to Codecov (optional)

3. **Build**
   - Builds the Next.js application
   - Verifies production build succeeds
   - Uploads build artifacts for inspection

### 🎭 E2E Tests Workflow

**File:** `.github/workflows/e2e.yml`

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

**Jobs:**

1. **Playwright E2E Tests**
   - Installs Playwright browsers
   - Runs end-to-end test suite
   - Uploads test reports and screenshots on failure

### 🤖 Dependabot

**File:** `.github/dependabot.yml`

**Configuration:**

- **npm dependencies**: Weekly updates every Monday at 9:00 AM
- **GitHub Actions**: Weekly updates every Monday at 9:00 AM
- Automatic PR creation with labels
- Conventional commit messages

## Running Checks Locally

Before pushing code, you can run the same checks locally:

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Build

```bash
npm run build
```

## Workflow Status

You can view the status of all workflows on the [Actions tab](https://github.com/YOUR_USERNAME/leaf-ink/actions) of the repository.

Status badges are displayed in the README:

- [![CI](https://github.com/YOUR_USERNAME/leaf-ink/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/leaf-ink/actions/workflows/ci.yml)
- [![E2E Tests](https://github.com/YOUR_USERNAME/leaf-ink/actions/workflows/e2e.yml/badge.svg)](https://github.com/YOUR_USERNAME/leaf-ink/actions/workflows/e2e.yml)

## Troubleshooting

### Failed Lint Check

- Run `npm run lint` locally to see errors
- Fix issues or run `npm run lint -- --fix` for auto-fixable problems

### Failed Type Check

- Run `npx tsc --noEmit` locally to see type errors
- Fix type issues in the reported files

### Failed Tests

- Run `npm test` locally to reproduce
- Check test output for specific failures
- Review test files and implementation

### Failed Build

- Run `npm run build` locally
- Check for missing environment variables
- Review build errors in the output

## Best Practices

1. **Always run checks locally** before pushing
2. **Fix CI failures immediately** - don't let them accumulate
3. **Review Dependabot PRs** regularly to keep dependencies up to date
4. **Monitor workflow execution times** - optimize if they become too slow
5. **Keep workflows simple** - complex workflows are harder to debug

## GitHub Actions Minutes

- **Public repositories**: Unlimited minutes
- **Private repositories**: 2,000 minutes/month on free tier

Monitor your usage in the repository settings under "Billing & plans".
