# Code Scaffolding with Plop.js

This project uses [Plop.js](https://plopjs.com/) to generate consistent, boilerplate code for components, hooks, and pages.

## Usage

### Generate a Component

```bash
npm run generate component
```

You'll be prompted for the component name. This will create:

```
src/components/[ComponentName]/
├── [ComponentName].tsx      # Component implementation
├── [ComponentName].test.tsx # Jest test file
└── index.ts                 # Barrel export
```

**Example:**

```bash
npm run generate component
? What is your component name? Button
```

Creates:

- `src/components/Button/Button.tsx`
- `src/components/Button/Button.test.tsx`
- `src/components/Button/index.ts`

### Generate a Hook

```bash
npm run generate hook
```

You'll be prompted for the hook name (with or without the `use` prefix). This will create:

```
src/hooks/
├── [useName].ts      # Hook implementation
└── [useName].test.ts # Jest test file
```

**Example:**

```bash
npm run generate hook
? What is your hook name? useCounter
```

Creates:

- `src/hooks/useCounter.ts`
- `src/hooks/useCounter.test.ts`

### Generate a Page

```bash
npm run generate page
```

You'll be prompted for the page name. This will create:

```
src/pages/[page-name].tsx  # Next.js page component
```

**Example:**

```bash
npm run generate page
? What is your page name (e.g., about, contact)? about
```

Creates:

- `src/pages/about.tsx`

## Templates

Templates are located in the `templates/` directory and use [Handlebars](https://handlebarsjs.com/) syntax.

### Page Template Features

- TypeScript with proper typing
- Next.js Head component for SEO
- Props interface
- Commented getStaticProps example
- Basic page structure

### Component Template Features

- TypeScript with proper typing
- Props interface
- Uses `cn` utility for className merging
- Basic test setup with React Testing Library

### Hook Template Features

- TypeScript with proper typing
- Basic useState example
- Test setup with `renderHook` from React Testing Library

## Customization

To modify the templates or add new generators, edit:

- **Configuration**: `plopfile.js`
- **Component Templates**: `templates/component/`
- **Hook Templates**: `templates/hook/`
- **Page Templates**: `templates/page/`

## Best Practices

1. **Use PascalCase** for component names (e.g., `Button`, `UserProfile`)
2. **Use camelCase** for hook names (e.g., `useCounter`, `useFetch`)
3. **Use kebab-case** for page names (e.g., `about`, `contact-us`)
4. **Customize generated code** after creation to fit your specific needs
5. **Update tests** to match your component/hook implementation
