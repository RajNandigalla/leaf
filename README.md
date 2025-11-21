# LeafInk

LeafInk is a modern web application built with Next.js, designed to provide a seamless and interactive user experience.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Sass](https://sass-lang.com/)
-   **Data Fetching**:
    -   [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL)
    -   [Axios](https://axios-http.com/) (REST API)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/) & [React Transition Group](https://reactcommunity.org/react-transition-group/)
-   **Utilities**: `dayjs`, `clsx`
-   **Testing**:
    -   [Jest](https://jestjs.io/) (Unit Testing)
    -   [Playwright](https://playwright.dev/) (End-to-End Testing)
-   **Code Quality**:
    -   [ESLint](https://eslint.org/)
    -   [Prettier](https://prettier.io/)
    -   [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/okonet/lint-staged)
    -   [Commitizen](https://github.com/commitizen/cz-cli)

## Getting Started

### Prerequisites

-   Node.js (see `.nvmrc` for version)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/leaf-ink.git
    cd leaf-ink
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

### Committing

We use Commitizen to ensure consistent commit messages. To commit your changes:

```bash
npm run commit
```

### Releasing and Changelog Generation

We use [standard-version](https://github.com/conventional-changelog/standard-version) to automatically generate changelogs based on conventional commits.

> **Note**: Release commands should only be run by project maintainers or release managers with write access to the repository. Regular contributors should use `npm run commit` for their commits.

#### How to Generate a Release

1. **Make sure all changes are committed** using conventional commits:
   ```bash
   npm run commit
   ```

2. **Run the release command**:
   ```bash
   npm run release        # Automatically determines version bump based on commits
   npm run release:patch  # For bug fixes (0.0.x)
   npm run release:minor  # For new features (0.x.0)
   npm run release:major  # For breaking changes (x.0.0)
   ```

3. **Push the changes and tags**:
   ```bash
   git push --follow-tags origin main
   ```

#### What Happens During Release

When you run `npm run release`, the following happens automatically:
- Analyzes your commits since the last release
- Determines the appropriate version bump (based on commit types: `feat`, `fix`, etc.)
- Updates the version in `package.json`
- Generates/updates `CHANGELOG.md` with all changes grouped by type
- Creates a git commit with the changes
- Creates a git tag for the new version

#### Example Workflow

```bash
# Make changes and commit using conventional commits
npm run commit
# (Select type: feat, fix, etc.)

# When ready to release
npm run release

# Push to remote
git push --follow-tags origin main
```

The `CHANGELOG.md` file will be automatically updated with entries like:
- **Features**: New functionality added
- **Bug Fixes**: Issues resolved
- **Documentation**: Documentation updates
- And more, based on your commit types

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
