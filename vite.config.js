import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const REQUIRED_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

// Valores colados mascarados (com •) passariam no build e só quebrariam o login em produção.
const VALID_ENV_VALUE = /^[\x21-\x7E]+$/;

// Sem isso, a falta de uma variável só apareceria como tela em branco no site publicado.
function assertBuildEnv(mode) {
  const env = loadEnv(mode, process.cwd(), 'VITE_FIREBASE_');
  const missing = REQUIRED_ENV.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes no build: ${missing.join(', ')}`);
  }
  const invalid = REQUIRED_ENV.filter((key) => !VALID_ENV_VALUE.test(env[key]));
  if (invalid.length > 0) {
    throw new Error(`Variáveis de ambiente com caracteres inválidos: ${invalid.join(', ')}`);
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === 'build') assertBuildEnv(mode);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      // Nada embutido como data:, para a CSP continuar com font-src 'self'.
      assetsInlineLimit: 0,
      // O SDK do Firebase é grande, mas muda pouco: em chunk próprio, sobrevive ao cache entre deploys.
      chunkSizeWarningLimit: 800,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ name: 'firebase', test: /node_modules[\\/]@?firebase/ }],
          },
        },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
    },
  };
});
