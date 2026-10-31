import {
  addDoc,
  arrayRemove,
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ROLE } from '@/utils/board';
import { deleteInBatches } from './batch';
import { db } from './firebase';
import { byCreatedAt, mapDoc } from './mappers';

const boardsCollection = collection(db, 'boards');
const boardRef = (boardId) => doc(db, 'boards', boardId);

export function subscribeBoards(uid, onData, onError) {
  const boardsQuery = query(boardsCollection, where('memberIds', 'array-contains', uid));
  return onSnapshot(
    boardsQuery,
    (snapshot) => onData(snapshot.docs.map(mapDoc).sort(byCreatedAt)),
    onError,
  );
}

export async function createBoard(user, { name, description }) {
  const created = await addDoc(boardsCollection, {
    name,
    description,
    ownerId: user.uid,
    members: {
      [user.uid]: { role: ROLE.OWNER, email: user.email, name: user.displayName || user.email },
    },
    memberIds: [user.uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export function updateBoard(boardId, { name, description }) {
  return updateDoc(boardRef(boardId), { name, description, updatedAt: serverTimestamp() });
}

export function setMemberRole(boardId, uid, role) {
  return updateDoc(boardRef(boardId), {
    [`members.${uid}.role`]: role,
    updatedAt: serverTimestamp(),
  });
}

/** Usado tanto para o dono remover alguém quanto para o membro sair do painel. */
export function removeMember(boardId, uid) {
  return updateDoc(boardRef(boardId), {
    [`members.${uid}`]: deleteField(),
    memberIds: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });
}

/** O painel é o último a sair: as Rules dependem dele para autorizar a cascata. */
export async function deleteBoard(boardId, ownerId) {
  const [tasks, groups, invites] = await Promise.all([
    getDocs(collection(db, 'boards', boardId, 'tasks')),
    getDocs(collection(db, 'boards', boardId, 'groups')),
    getDocs(
      query(
        collection(db, 'invites'),
        where('boardId', '==', boardId),
        where('invitedBy', '==', ownerId),
      ),
    ),
  ]);
  await deleteInBatches([...tasks.docs, ...groups.docs, ...invites.docs].map((d) => d.ref));
  await deleteInBatches([boardRef(boardId)]);
}
