import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, clearLocalData } from './firebase';

// Credenciais erradas têm mensagem única para não revelar quais e-mails existem.
const INVALID_CREDENTIALS = 'E-mail ou senha incorretos.';

const AUTH_ERRORS = {
  'auth/invalid-credential': INVALID_CREDENTIALS,
  'auth/user-not-found': INVALID_CREDENTIALS,
  'auth/wrong-password': INVALID_CREDENTIALS,
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'Essa senha é fraca demais.',
  'auth/password-does-not-meet-requirements': 'A senha não atende aos requisitos mínimos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
};

function toAuthError(error) {
  return new Error(AUTH_ERRORS[error?.code] ?? 'Não foi possível concluir. Tente novamente.');
}

export async function signIn({ email, password }) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signUp({ name, email, password }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    // A conta já existe: uma falha aqui é recuperável pelo botão de reenvio do banner.
    await sendEmailVerification(user).catch(() => {});
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function resendVerification() {
  try {
    await sendEmailVerification(auth.currentUser);
  } catch (error) {
    throw toAuthError(error);
  }
}

/** Conta inexistente conta como sucesso, para não revelar quais e-mails estão cadastrados. */
export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw toAuthError(error);
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
  await clearLocalData();
  window.location.assign('/login');
}
