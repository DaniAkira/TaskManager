// Ordenação fracionária: mover uma tarefa grava um único documento, em vez de
// reescrever a coluna inteira a cada drag.
export const ORDER_STEP = 1024;
const MIN_GAP = 1e-3;

/** Ordem entre dois vizinhos, ou null quando não há mais precisão e a coluna precisa ser reindexada. */
export function orderBetween(prev, next) {
  if (prev == null && next == null) return Date.now();
  if (prev == null) return next - ORDER_STEP;
  if (next == null) return prev + ORDER_STEP;
  if (next - prev < MIN_GAP) return null;
  return (prev + next) / 2;
}

/** Calcula as gravações para colocar taskId na posição em que ele aparece em orderedIds. */
export function planMove({ taskId, groupId, orderedIds, tasksById }) {
  const index = orderedIds.indexOf(taskId);
  const task = tasksById[taskId];
  const prev = tasksById[orderedIds[index - 1]]?.order;
  const next = tasksById[orderedIds[index + 1]]?.order;

  const alreadyInPlace =
    task.groupId === groupId &&
    (prev == null || prev < task.order) &&
    (next == null || task.order < next);
  if (alreadyInPlace) return [];

  const order = orderBetween(prev, next);
  if (order != null) return [{ id: taskId, groupId, order }];

  const base = tasksById[orderedIds[0]]?.order ?? 0;
  return orderedIds.map((id, i) => ({ id, groupId, order: base + i * ORDER_STEP }));
}
