import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { STATUS } from '@/constants/task';
import { chunk, deleteInBatches } from './batch';
import { db } from './firebase';
import { mapDoc } from './mappers';

const tasksCollection = (boardId) => collection(db, 'boards', boardId, 'tasks');
const taskRef = (boardId, taskId) => doc(db, 'boards', boardId, 'tasks', taskId);

const touched = (uid) => ({ updatedBy: uid, updatedAt: serverTimestamp() });

/** O board só escuta tarefas ativas: as concluídas não geram leituras até serem abertas. */
export function subscribeActiveTasks(boardId, onData, onError) {
  const activeQuery = query(tasksCollection(boardId), where('completedAt', '==', null));
  return onSnapshot(activeQuery, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError);
}

export function subscribeCompletedTasks(boardId, max, onData, onError) {
  const completedQuery = query(
    tasksCollection(boardId),
    where('status', '==', STATUS.DONE),
    orderBy('completedAt', 'desc'),
    limit(max),
  );
  return onSnapshot(completedQuery, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError);
}

export function createTask(boardId, uid, values) {
  return addDoc(tasksCollection(boardId), {
    ...values,
    previousStatus: null,
    order: Date.now(),
    completedAt: null,
    createdBy: uid,
    createdAt: serverTimestamp(),
    ...touched(uid),
  });
}

/** Grava só os campos alterados, para edições simultâneas em campos diferentes não colidirem. */
export function updateTask(boardId, taskId, uid, changes) {
  return updateDoc(taskRef(boardId, taskId), { ...changes, ...touched(uid) });
}

export function completeTask(boardId, uid, task) {
  return updateTask(boardId, task.id, uid, {
    status: STATUS.DONE,
    previousStatus: task.status,
    completedAt: serverTimestamp(),
  });
}

export function restoreTask(boardId, uid, task) {
  return updateTask(boardId, task.id, uid, {
    status: task.previousStatus ?? STATUS.NOT_STARTED,
    previousStatus: null,
    completedAt: null,
  });
}

export function resetTask(boardId, uid, task) {
  return updateTask(boardId, task.id, uid, {
    status: STATUS.NOT_STARTED,
    subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: false })),
  });
}

export function deleteTask(boardId, taskId) {
  return deleteDoc(taskRef(boardId, taskId));
}

export function deleteTasks(boardId, taskIds) {
  return deleteInBatches(taskIds.map((id) => taskRef(boardId, id)));
}

export async function applyTaskMoves(boardId, uid, moves) {
  for (const part of chunk(moves)) {
    const batch = writeBatch(db);
    part.forEach(({ id, groupId, order }) =>
      batch.update(taskRef(boardId, id), { groupId, order, ...touched(uid) }),
    );
    await batch.commit();
  }
}

/** Criar no destino e excluir na origem no mesmo batch: a tarefa nunca some nem duplica. */
export function moveTaskToBoard({ fromBoardId, toBoardId, toGroupId, uid, task }) {
  const { id, ...data } = task;
  const batch = writeBatch(db);
  batch.set(taskRef(toBoardId, id), {
    ...data,
    groupId: toGroupId,
    order: Date.now(),
    createdBy: uid,
    createdAt: serverTimestamp(),
    ...touched(uid),
  });
  batch.delete(taskRef(fromBoardId, id));
  return batch.commit();
}
