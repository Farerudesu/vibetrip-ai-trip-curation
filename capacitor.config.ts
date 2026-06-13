import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vibetrip.app',
  appName: 'VibeTrip',
  webDir: 'dist',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    }
  },
};

export default config;
