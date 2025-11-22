import 'next-i18next';

declare module 'next-i18next' {
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
