import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streetgo.app',
  appName: 'StreetGo',

  server: {
    url: 'https://streetgo.app',
    cleartext: false,
  },
};

export default config;