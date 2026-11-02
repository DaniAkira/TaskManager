import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { chunk, deleteInBatches } from './batch';
import { db } from './firebase';
import { byCreatedAt, mapDoc } from './mappers';

const groupsCollection = (boardId) => collection(db, 'boards', boardId, 'groups');
const groupRef = (boardId, groupId) => doc(db, 'boards', boardId, 'groups', groupId);

export function subscribeGroups(boardId, onData, onError) {
  return onSnapshot(
    groupsCollection(boardId),
    (snapshot) => onData(snapshot.docs.map(mapDoc).sort(byCreatedAt)),
    onError,
  );
}

export function createGroup(boardId, uid, { name, color }) {
  return addDoc(groupsCollection(boardId), {
    name,
    color,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateGroup(boardId, groupId, { name, color }) {
  return updateDoc(groupRef(boardId, groupId), { name, color, updatedAt: serverTimestamp() });
}

/** Grava as posições na grade em um único batch: arrastar um bloco pode empurrar vários. */
export async function updateGroupLayouts(boardId, changes) {
  for (const part of chunk(changes)) {
    const batch = writeBatch(db);
    part.forEach(({ id, layout }) =>
      batch.update(groupRef(boardId, id), { layout, updatedAt: serverTimestamp() }),
    );
    await batch.commit();
  }
}

/** Remove o grupo e todas as tarefas dele, inclusive as já concluídas. */
export async function deleteGroup(boardId, groupId) {
  const tasks = await getDocs(
    query(collection(db, 'boards', boardId, 'tasks'), where('groupId', '==', groupId)),
  );
  await deleteInBatches(tasks.docs.map((d) => d.ref));
  await deleteInBatches([groupRef(boardId, groupId)]);
}
