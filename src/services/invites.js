import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { mapDoc } from './mappers';

const INVITE_STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', DECLINED: 'declined' };

const invitesCollection = collection(db, 'invites');

// ID determinístico: as Rules localizam o convite pelo painel + e-mail do token,
// e reconvidar a mesma pessoa não cria duplicatas.
const inviteRef = (boardId, email) => doc(db, 'invites', `${boardId}_${email}`);

export function subscribeMyInvites(email, onData, onError) {
  const inviteQuery = query(
    invitesCollection,
    where('email', '==', email),
    where('status', '==', INVITE_STATUS.PENDING),
  );
  return onSnapshot(inviteQuery, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError);
}

export function subscribeBoardInvites(boardId, uid, onData, onError) {
  const inviteQuery = query(
    invitesCollection,
    where('boardId', '==', boardId),
    where('invitedBy', '==', uid),
    where('status', '==', INVITE_STATUS.PENDING),
  );
  return onSnapshot(inviteQuery, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError);
}

export function sendInvite({ board, email, role, sender }) {
  return setDoc(inviteRef(board.id, email), {
    boardId: board.id,
    boardName: board.name,
    email,
    role,
    status: INVITE_STATUS.PENDING,
    invitedBy: sender.uid,
    invitedByName: sender.displayName || sender.email,
    createdAt: serverTimestamp(),
    respondedAt: null,
  });
}

export function cancelInvite(boardId, email) {
  return deleteDoc(inviteRef(boardId, email));
}

export function declineInvite(invite) {
  return updateDoc(inviteRef(invite.boardId, invite.email), {
    status: INVITE_STATUS.DECLINED,
    respondedAt: serverTimestamp(),
  });
}

/** Batch atômico: as Rules exigem o convite aceito na mesma escrita que adiciona o membro. */
export function acceptInvite(invite, user) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'boards', invite.boardId), {
    [`members.${user.uid}`]: {
      role: invite.role,
      email: user.email,
      name: user.displayName || user.email,
    },
    memberIds: arrayUnion(user.uid),
    updatedAt: serverTimestamp(),
  });
  batch.update(inviteRef(invite.boardId, invite.email), {
    status: INVITE_STATUS.ACCEPTED,
    respondedAt: serverTimestamp(),
  });
  return batch.commit();
}
