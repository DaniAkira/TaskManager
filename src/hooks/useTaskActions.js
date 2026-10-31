import { useCallback, useMemo } from 'react';
import { ON_COMPLETE, STATUS } from '@/constants/task';
import {
  completeTask,
  deleteTask,
  resetTask,
  restoreTask,
  updateTask,
} from '@/services/tasks';
import { friendlyError } from '@/utils/errors';
import { useAuth, useConfirm, useToast } from './useContexts';

/** Regras de negócio de uma tarefa: o fluxo de finalização, reset, exclusão e desfazer. */
export function useTaskActions(boardId) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const uid = user.uid;

  const guard = useCallback(
    (promise) => promise.catch((error) => toast.error(friendlyError(error))),
    [toast],
  );

  const finishTask = useCallback(
    async (task) => {
      if (task.onComplete === ON_COMPLETE.RESET) {
        const accepted = await confirm({
          title: 'Resetar tarefa?',
          message: `“${task.title}” voltará para “Não iniciada” e o checklist será desmarcado.`,
          confirmLabel: 'Resetar',
        });
        if (accepted) await guard(resetTask(boardId, uid, task));
        return;
      }
      await guard(completeTask(boardId, uid, task));
      toast.success('Tarefa enviada para Concluídas.', {
        label: 'Desfazer',
        onClick: () => guard(restoreTask(boardId, uid, { ...task, previousStatus: task.status })),
      });
    },
    [boardId, confirm, guard, toast, uid],
  );

  const changeStatus = useCallback(
    (task, status) => {
      if (status === task.status) return undefined;
      if (status === STATUS.DONE) return finishTask(task);
      return guard(updateTask(boardId, task.id, uid, { status }));
    },
    [boardId, finishTask, guard, uid],
  );

  const saveFields = useCallback(
    (task, changes) => guard(updateTask(boardId, task.id, uid, changes)),
    [boardId, guard, uid],
  );

  const removeTask = useCallback(
    async (task) => {
      const accepted = await confirm({
        title: 'Excluir tarefa?',
        message: `“${task.title}” será excluída definitivamente.`,
        confirmLabel: 'Excluir',
        danger: true,
      });
      if (!accepted) return false;
      await guard(deleteTask(boardId, task.id));
      return true;
    },
    [boardId, confirm, guard],
  );

  return useMemo(
    () => ({ changeStatus, saveFields, removeTask }),
    [changeStatus, saveFields, removeTask],
  );
}
