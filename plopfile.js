module.exports = function (plop) {
  plop.setWelcomeMessage('🌿 LeafInk Code Generator - What would you like to create?');

  // Component Generator
  plop.setGenerator('component', {
    description: '🧩 Create a reusable React component with tests',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your component name?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'templates/component/component.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
        templateFile: 'templates/component/test.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/index.ts',
        templateFile: 'templates/component/index.hbs',
      },
    ],
  });

  // Hook Generator
  plop.setGenerator('hook', {
    description: '🪝 Create a custom React hook with tests',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your hook name?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}/{{camelCase name}}.ts',
        templateFile: 'templates/hook/hook.hbs',
      },
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}/{{camelCase name}}.test.ts',
        templateFile: 'templates/hook/test.hbs',
      },
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}/index.ts',
        templateFile: 'templates/hook/index.hbs',
      },
    ],
  });

  // Page Generator
  plop.setGenerator('page', {
    description: '📄 Create a Next.js page (static/dynamic with SSG/SSR)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your page name (e.g., about, contact)?',
      },
      {
        type: 'confirm',
        name: 'isDynamic',
        message: 'Is this a dynamic route?',
        default: false,
      },
      {
        type: 'input',
        name: 'paramName',
        message: 'What is the parameter name (e.g., id, slug)?',
        when: (answers) => answers.isDynamic,
        default: 'id',
      },
      {
        type: 'list',
        name: 'dataFetching',
        message: 'Which data fetching method do you need?',
        choices: [
          { name: 'None (client-side only)', value: 'none' },
          { name: 'getStaticProps (SSG)', value: 'static' },
          { name: 'getServerSideProps (SSR)', value: 'server' },
        ],
        default: 'none',
      },
    ],
    actions: (data) => {
      const actions = [];

      // Determine the file path based on whether it's dynamic
      const filePath = data.isDynamic
        ? `src/pages/{{kebabCase name}}/[{{paramName}}].tsx`
        : `src/pages/{{kebabCase name}}.tsx`;

      actions.push({
        type: 'add',
        path: filePath,
        templateFile: `templates/page/{{dataFetching}}${data.isDynamic ? '-dynamic' : ''}.hbs`,
      });

      return actions;
    },
  });
};
