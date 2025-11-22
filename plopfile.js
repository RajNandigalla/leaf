module.exports = function (plop) {
  // Component Generator
  plop.setGenerator('component', {
    description: 'Create a reusable component',
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
    description: 'Create a custom hook',
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
    description: 'Create a new page',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your page name (e.g., about, contact)?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/pages/{{kebabCase name}}.tsx',
        templateFile: 'templates/page/page.hbs',
      },
    ],
  });
};
