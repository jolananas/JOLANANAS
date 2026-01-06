import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../app/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../app/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config) => {
    // Résolution des modules pour pnpm
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/config': path.resolve(__dirname, '../node_modules/next/config.js'),
        'next': path.resolve(__dirname, '../node_modules/next'),
      };
      
      // Ajouter le répertoire racine à la résolution
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        path.resolve(__dirname, '..'),
      ];
    }
    
    return config;
  },
};

export default config;

