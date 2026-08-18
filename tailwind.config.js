/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-', // Regra 9: Isolamento de Frameworks CSS
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Single Source of Truth para Temas (Regra 9)
        // Herda exatamente as variáveis nativas geradas pelo Quasar/Nosso Sistema
        primary: 'var(--q-primary)',
        secondary: 'var(--q-secondary)',
        accent: 'var(--q-accent)',
        positive: 'var(--q-positive)',
        negative: 'var(--q-negative)',
        info: 'var(--q-info)',
        warning: 'var(--q-warning)',
        dark: 'var(--q-dark)',
        'dark-page': 'var(--q-dark-page)',
      },
    },
  },
  plugins: [],
};
