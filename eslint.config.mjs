import nextConfig from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    rules: {
      '@next/next/no-page-custom-font': 'off',
      // Data-fetching functions called from useEffect intentionally set state
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
