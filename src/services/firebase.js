import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  clearIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missing.length > 0) {
  throw new Error(`Configuração do Firebase ausente no .env.local: ${missing.join(', ')}`);
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Idioma dos e-mails de verificação e recuperação de senha.
auth.languageCode = 'pt-BR';

// O cache local retoma os listeners sem reler tudo do servidor a cada visita.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

/** Apaga do dispositivo os dados em cache ao sair. Exige recarregar a página depois. */
export async function clearLocalData() {
  await terminate(db);
  // Falha se houver outra aba aberta; ela ainda usa o cache e o limpa quando sair.
  await clearIndexedDbPersistence(db).catch(() => {});
}
