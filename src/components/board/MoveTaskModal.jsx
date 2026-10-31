import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useGroups } from '@/hooks/useBoardData';
import { useAuth, useToast, useWorkspace } from '@/hooks/useContexts';
import { moveTaskToBoard } from '@/services/tasks';
import { canEditBoard } from '@/utils/board';
import { friendlyError } from '@/utils/errors';

export function MoveTaskModal({ task, fromBoardId, initialBoardId, onClose, onMoved }) {
  const { user } = useAuth();
  const { boards } = useWorkspace();
  const toast = useToast();
  const targets = boards.filter((board) => board.id !== fromBoardId && canEditBoard(board, user.uid));
  const [boardId, setBoardId] = useState(initialBoardId ?? targets[0]?.id ?? '');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const { data: groups, loading } = useGroups(boardId);

  const groupId = groups?.some((group) => group.id === selectedGroupId)
    ? selectedGroupId
    : (groups?.[0]?.id ?? '');

  const handleMove = () => {
    moveTaskToBoard({ fromBoardId, toBoardId: boardId, toGroupId: groupId, uid: user.uid, task })
      .catch((error) => toast.error(friendlyError(error)));
    onMoved?.();
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Mover tarefa"
      description={task.title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!groupId} onClick={handleMove}>
            Mover
          </Button>
        </>
      }
    >
      {targets.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Você não tem outro painel com permissão de edição para receber esta tarefa.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Painel de destino">
            {(control) => (
              <Select {...control} value={boardId} onChange={(event) => setBoardId(event.target.value)}>
                {targets.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field
            label="Grupo"
            hint={!loading && groups?.length === 0 ? 'Este painel ainda não tem grupos.' : undefined}
          >
            {(control) => (
              <Select
                {...control}
                value={groupId}
                disabled={!groups?.length}
                onChange={(event) => setSelectedGroupId(event.target.value)}
              >
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      )}
    </Modal>
  );
}
