import { defineCapacitorConfig } from '@quasar/app-vite/capacitor';

export default defineCapacitorConfig({
  appId: 'com.ficouclaro.app',
  appName: 'Ficou Claro?',
  server: {
    cleartext: true,
    androidScheme: 'http',
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      launchFadeOutDuration: 500,
      backgroundColor: '#1976D2',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
});
