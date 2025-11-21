import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './messages/**/*.{json,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb'
      }
    }
  },
  plugins: []
};

export default config;
