import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core';
import { Lock, Plus, StickyNote } from 'lucide-react';
import { BoardColumn } from '@/components/board/BoardColumn';
import { BoardDropDock } from '@/components/board/BoardDropDock';
import { BoardHeader } from '@/components/board/BoardHeader';
import { GroupFormModal } from '@/components/board/GroupFormModal';
import { MoveTaskModal } from '@/components/board/MoveTaskModal';
import { TaskCard } from '@/components/board/TaskCard';
import { TaskDetailModal } from '@/components/board/TaskDetailModal';
import { TaskFormModal } from '@/components/board/TaskFormModal';
import { BoardFormModal } from '@/components/shared/BoardFormModal';
import { ShareBoardModal } from '@/components/shared/ShareBoardModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useActiveTasks, useGroups } from '@/hooks/useBoardData';
import { useAuth, useConfirm, useToast, useWorkspace } from '@/hooks/useContexts';
import { useTaskActions } from '@/hooks/useTaskActions';
import { useTaskDnd } from '@/hooks/useTaskDnd';
import { deleteGroup } from '@/services/groups';
import { canEditBoard } from '@/utils/board';
import { friendlyError } from '@/utils/errors';

const TASK_PARAM = 'tarefa';
const DND_MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };
const NO_ITEMS = [];

function BoardUnavailable() {
  return (
    <EmptyState
      icon={Lock}
      title="Painel indisponível"
      action={
        <Link to="/" className="font-semibold text-accent hover:text-accent-hover">
          Voltar para os painéis
        </Link>
      }
    >
      Ele foi excluído ou você não tem mais acesso.
    </EmptyState>
  );
}

function BoardView({ board }) {
  const { user } = useAuth();
  const { boards } = useWorkspace();
  const confirm = useConfirm();
  const toast = useToast();
  const actions = useTaskActions(board.id);
  const groupsState = useGroups(board.id);
  const tasksState = useActiveTasks(board.id);
  const groups = groupsState.data ?? NO_ITEMS;
  const tasks = tasksState.data ?? NO_ITEMS;
  const [searchParams, setSearchParams] = useSearchParams();

  // null = fechado. Os modais de criação e edição compartilham este estado.
  const [groupForm, setGroupForm] = useState(null);
  const [taskFormGroupId, setTaskFormGroupId] = useState(null);
  const [moveRequest, setMoveRequest] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [editingBoard, setEditingBoard] = useState(false);

  const canEdit = canEditBoard(board, user.uid);
  const groupsById = useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups]);
  const tasksById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);
  const moveTargets = useMemo(
    () => boards.filter((b) => b.id !== board.id && canEditBoard(b, user.uid)),
    [boards, board.id, user.uid],
  );

  const { columns, activeTask, dndProps } = useTaskDnd({
    boardId: board.id,
    groups,
    tasks,
    onDropOnBoard: (task, target) => setMoveRequest({ task, boardId: target.id }),
  });

  // O detalhe fica na URL: o botão voltar do celular fecha o modal e o link pode ser copiado.
  const openTask = (taskId) => setSearchParams({ [TASK_PARAM]: taskId });
  const closeTask = () => setSearchParams({}, { replace: true });
  const selectedTask = tasksById[searchParams.get(TASK_PARAM)];

  const removeGroup = async (group) => {
    const count = columns[group.id]?.length ?? 0;
    const accepted = await confirm({
      title: 'Excluir grupo?',
      message: `“${group.name}” será excluído com ${count} tarefa(s) ativa(s) e as concluídas dele. Não há como desfazer.`,
      confirmLabel: 'Excluir grupo',
      danger: true,
    });
    if (accepted) deleteGroup(board.id, group.id).catch((error) => toast.error(friendlyError(error)));
  };

  if (groupsState.error || tasksState.error) return <BoardUnavailable />;
  if (groupsState.loading || tasksState.loading) return <PageSpinner />;

  return (
    <div className="flex h-full flex-col">
      <BoardHeader
        board={board}
        uid={user.uid}
        canEdit={canEdit}
        onAddGroup={() => setGroupForm({ group: null })}
        onShare={() => setSharing(true)}
        onEdit={() => setEditingBoard(true)}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Nenhum grupo ainda"
          action={
            canEdit && (
              <Button variant="primary" onClick={() => setGroupForm({ group: null })}>
                <Plus aria-hidden className="size-4" />
                Criar primeiro grupo
              </Button>
            )
          }
        >
          Grupos reúnem tarefas do mesmo assunto, cada um com a sua cor.
        </EmptyState>
      ) : (
        <DndContext {...dndProps} measuring={DND_MEASURING}>
          <div className="flex min-h-0 flex-1 snap-x snap-proximity items-start gap-3.5 overflow-x-auto px-4 pb-4 sm:px-6">
            {groups.map((group) => (
              <BoardColumn
                key={group.id}
                group={group}
                taskIds={columns[group.id] ?? NO_ITEMS}
                tasksById={tasksById}
                canEdit={canEdit}
                onOpenTask={openTask}
                onStatusChange={actions.changeStatus}
                onAddTask={setTaskFormGroupId}
                onEditGroup={(target) => setGroupForm({ group: target })}
                onDeleteGroup={removeGroup}
              />
            ))}
          </div>
          {activeTask && <BoardDropDock boards={moveTargets} />}
          <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            {activeTask && (
              <TaskCard
                lifted
                task={activeTask}
                color={groupsById[activeTask.groupId]?.color}
                canEdit={canEdit}
                onStatusChange={actions.changeStatus}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {selectedTask && groupsById[selectedTask.groupId] && (
        <TaskDetailModal
          task={selectedTask}
          group={groupsById[selectedTask.groupId]}
          groups={groups}
          boardId={board.id}
          canEdit={canEdit}
          actions={actions}
          onClose={closeTask}
          onMove={(task) => setMoveRequest({ task, boardId: null })}
        />
      )}
      {taskFormGroupId && (
        <TaskFormModal
          boardId={board.id}
          groups={groups}
          groupId={taskFormGroupId}
          actions={actions}
          onClose={() => setTaskFormGroupId(null)}
        />
      )}
      {groupForm && (
        <GroupFormModal boardId={board.id} group={groupForm.group} onClose={() => setGroupForm(null)} />
      )}
      {moveRequest && (
        <MoveTaskModal
          task={moveRequest.task}
          fromBoardId={board.id}
          initialBoardId={moveRequest.boardId}
          onClose={() => setMoveRequest(null)}
          onMoved={closeTask}
        />
      )}
      {sharing && <ShareBoardModal board={board} onClose={() => setSharing(false)} />}
      {editingBoard && <BoardFormModal board={board} onClose={() => setEditingBoard(false)} />}
    </div>
  );
}

export function BoardPage() {
  const { boardId } = useParams();
  const { boards, boardsLoading } = useWorkspace();
  const board = boards.find((candidate) => candidate.id === boardId);

  if (board) return <BoardView key={boardId} board={board} />;
  return boardsLoading ? <PageSpinner /> : <BoardUnavailable />;
}
