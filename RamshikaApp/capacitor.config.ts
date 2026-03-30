import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ramshika.app',
  appName: 'Ramshika',
  webDir: 'www',
  server: {
    url: 'https://www.ramshika.com',
    cleartext: true
  }
};

export default config;
