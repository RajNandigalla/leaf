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

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
