import { defineCapacitorConfig } from '@quasar/app-vite/capacitor';

export default defineCapacitorConfig({
  appId: 'com.ficouclaro.app',
  appName: 'Ficou Claro',
  server: {
    cleartext: true,
    androidScheme: 'http',
  },
});
