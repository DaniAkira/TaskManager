import { writeBatch } from 'firebase/firestore';
import { WRITE_BATCH_SIZE } from '@/constants/limits';
import { db } from './firebase';

export function chunk(items, size = WRITE_BATCH_SIZE) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/** Exclui documentos em lotes sequenciais. Sem Cloud Functions, a cascata roda no cliente. */
export async function deleteInBatches(refs) {
  for (const part of chunk(refs)) {
    const batch = writeBatch(db);
    part.forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
