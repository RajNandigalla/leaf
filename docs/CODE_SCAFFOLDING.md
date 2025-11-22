# Code Scaffolding with Plop.js

This project uses [Plop.js](https://plopjs.com/) to generate consistent, boilerplate code for components, hooks, and pages.

## Quick Start

Run the generator:

```bash
npm run generate
```

You'll see:

```
🌿 LeafInk Code Generator - What would you like to create?
❯ 🧩 Create a reusable React component with tests
  🪝 Create a custom React hook with tests
  📄 Create a Next.js page (static/dynamic with SSG/SSR)
```

## Generators

### 🧩 Component Generator

Creates a new React component with TypeScript, tests, and proper structure.

**Command:**

```bash
npm run generate
# Select: 🧩 Create a reusable React component with tests
```

**Prompts:**

- Component name (e.g., `Button`, `UserCard`)

**Creates:**

```
src/components/[ComponentName]/
├── [ComponentName].tsx      # Component implementation
├── [ComponentName].test.tsx # Jest test file
└── index.ts                 # Barrel export
```

**Features:**

- TypeScript with props interface
- `cn` utility for className merging
- React Testing Library test setup

---

### 🪝 Hook Generator

Creates a custom React hook with TypeScript and tests.

**Command:**

```bash
npm run generate
# Select: 🪝 Create a custom React hook with tests
```

**Prompts:**

- Hook name (e.g., `useCounter`, `useFetch`)

**Creates:**

```
src/hooks/[useName]/
├── [useName].ts      # Hook implementation
├── [useName].test.ts # Jest test file
└── index.ts          # Barrel export
```

**Features:**

- TypeScript with proper typing
- `renderHook` test setup
- Basic useState example

---

### 📄 Page Generator

Creates a Next.js page with support for static/dynamic routes and SSG/SSR.

**Command:**

```bash
npm run generate
# Select: 📄 Create a Next.js page (static/dynamic with SSG/SSR)
```

**Prompts:**

1. **Page name** (e.g., `about`, `posts`)
2. **Is this a dynamic route?** (Yes/No)
3. **Parameter name** (if dynamic, e.g., `id`, `slug`)
4. **Data fetching method:**
   - None (client-side only)
   - getStaticProps (SSG)
   - getServerSideProps (SSR)

**Examples:**

#### Static Page (No Data Fetching)

```bash
? Page name: about
? Is this a dynamic route? No
? Data fetching method: None
```

Creates: `src/pages/about.tsx`

#### Static Page with SSG

```bash
? Page name: blog
? Is this a dynamic route? No
? Data fetching method: getStaticProps (SSG)
```

Creates: `src/pages/blog.tsx` with `getStaticProps`

#### Dynamic Page with SSG

```bash
? Page name: posts
? Is this a dynamic route? Yes
? Parameter name: id
? Data fetching method: getStaticProps (SSG)
```

Creates: `src/pages/posts/[id].tsx` with `getStaticPaths` + `getStaticProps`

#### Dynamic Page with SSR

```bash
? Page name: user
? Is this a dynamic route? Yes
? Parameter name: id
? Data fetching method: getServerSideProps (SSR)
```

Creates: `src/pages/user/[id].tsx` with `getServerSideProps`

**Features:**

- TypeScript with type inference (`InferGetStaticPropsType`, `InferGetServerSidePropsType`)
- Next.js Head component for SEO
- `useRouter` for dynamic routes
- `getStaticPaths` for SSG dynamic routes
- Fallback handling for SSG
- Context params extraction

## Templates

Templates are located in the `templates/` directory and use [Handlebars](https://handlebarsjs.com/) syntax.

### Available Templates

**Components:**

- `templates/component/component.hbs`
- `templates/component/test.hbs`
- `templates/component/index.hbs`

**Hooks:**

- `templates/hook/hook.hbs`
- `templates/hook/test.hbs`
- `templates/hook/index.hbs`

**Pages:**

- `templates/page/none.hbs` - Client-side only
- `templates/page/static.hbs` - SSG
- `templates/page/server.hbs` - SSR
- `templates/page/none-dynamic.hbs` - Dynamic client-side
- `templates/page/static-dynamic.hbs` - Dynamic SSG
- `templates/page/server-dynamic.hbs` - Dynamic SSR

## Customization

To modify templates or add new generators, edit:

- **Configuration**: `plopfile.js`
- **Component Templates**: `templates/component/`
- **Hook Templates**: `templates/hook/`
- **Page Templates**: `templates/page/`

## Best Practices

1. **Use PascalCase** for component names (e.g., `Button`, `UserProfile`)
2. **Use camelCase** for hook names (e.g., `useCounter`, `useFetch`)
3. **Use kebab-case** for page names (e.g., `about`, `contact-us`)
4. **Choose the right data fetching method:**
   - **None** - For client-side data fetching or static content
   - **SSG** - For content that can be pre-rendered at build time
   - **SSR** - For content that needs fresh data on every request
5. **Use dynamic routes** for pages with variable segments (e.g., `/posts/[id]`)
6. **Customize generated code** after creation to fit your specific needs
7. **Update tests** to match your implementation
