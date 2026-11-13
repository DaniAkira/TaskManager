import { useSyncExternalStore } from 'react';

// Um único relógio para o app inteiro: cada post-it lê o mesmo valor, em vez de
// manter o próprio setInterval. Para quando ninguém está ouvindo.
const TICK_MS = 30_000;
const listeners = new Set();
let now = Date.now();
let timer = null;

function subscribe(listener) {
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Hora atual em milissegundos, atualizada a cada 30 segundos. */
export function useNow() {
  return useSyncExternalStore(subscribe, () => now);
}
