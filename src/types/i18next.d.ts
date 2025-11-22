import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: {
        welcome: string;
        description: string;
        change_language: string;
      };
    };
  }
}
