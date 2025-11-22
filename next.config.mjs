import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.join(
      process.cwd(),
      'lib/shims/async-storage.ts'
    );
    return config;
  }
};

export default withNextIntl(nextConfig);
