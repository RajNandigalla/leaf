# Contributing to LeafInk

Thank you for your interest in contributing to LeafInk! We welcome contributions from the community.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/leaf-ink.git
    cd leaf-ink
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
4.  **Set up your environment**:
    Ensure you are using the correct Node.js version (check `.nvmrc`).
    ```bash
    nvm use
    ```

## Development Workflow

1.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/my-new-feature
    ```
2.  **Make your changes**.
3.  **Run tests** to ensure everything is working:
    ```bash
    npm run test      # Run unit tests
    npm run test:e2e  # Run E2E tests
    ```
4.  **Commit your changes**. We use [Commitizen](https://github.com/commitizen/cz-cli) to enforce conventional commit messages.
    ```bash
    npm run commit
    ```
    Follow the prompts to generate a formatted commit message.

    **Commit Message Format:**
    We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. A commit message consists of a **header**, a **body**, and a **footer**.

    ```
    <type>(<scope>): <subject>
    <BLANK LINE>
    <body>
    <BLANK LINE>
    <footer>
    ```

    **Supported Types:**
    -   `feat`: A new feature
    -   `fix`: A bug fix
    -   `docs`: Documentation only changes
    -   `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    -   `refactor`: A code change that neither fixes a bug nor adds a feature
    -   `perf`: A code change that improves performance
    -   `test`: Adding missing tests or correcting existing tests
    -   `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
    -   `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
    -   `chore`: Other changes that don't modify src or test files
    -   `revert`: Reverts a previous commit

## Code Quality

-   **Linting**: We use ESLint and Prettier. Code is automatically linted and formatted on commit via Husky and lint-staged.
-   **Testing**: Please ensure all new features are covered by unit tests (Jest) and/or E2E tests (Playwright).

## Pull Requests

1.  Push your branch to your fork:
    ```bash
    git push origin feature/my-new-feature
    ```
2.  Open a **Pull Request** against the `main` branch of the original repository.
3.  Provide a clear description of your changes and link to any relevant issues.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
