import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streetgo.app',
  appName: 'StreetGo',
  webDir: 'out',
  server: {
    url: 'https://tunda-street.vercel.app'
  }
};

export default config;