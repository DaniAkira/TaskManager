import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { COMPLETED_PAGE_SIZE } from '@/constants/limits';
import { useCompletedTasks, useGroups } from '@/hooks/useBoardData';
import { useAuth, useConfirm, useToast, useWorkspace } from '@/hooks/useContexts';
import { deleteTasks, restoreTask } from '@/services/tasks';
import { canEditBoard } from '@/utils/board';
import { formatDateTime } from '@/utils/dates';
import { friendlyError } from '@/utils/errors';

function CompletedRow({ task, group, canEdit, selected, onToggle, onRestore, onDelete }) {
  return (
    <li className="flex animate-rise items-center gap-3 px-3 py-2.5 sm:px-4">
      {canEdit && (
        <input
          type="checkbox"
          aria-label={`Selecionar ${task.title}`}
          checked={selected}
          onChange={() => onToggle(task.id)}
          className="size-4 shrink-0 accent-(--accent)"
        />
      )}
      <span aria-hidden style={{ backgroundColor: group?.color }} className="size-3 shrink-0 rounded-[3px]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{task.title}</p>
        <p className="truncate text-xs text-ink-faint">
          {group?.name} · {formatDateTime(task.completedAt)}
        </p>
      </div>
      {canEdit && (
        <>
          <Button size="sm" onClick={() => onRestore(task)} aria-label={`Reverter ${task.title}`}>
            <RotateCcw aria-hidden className="size-3.5" />
            <span className="hidden sm:inline">Reverter</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete([task])} aria-label={`Excluir ${task.title}`}>
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </>
      )}
    </li>
  );
}

export function CompletedTasksPage() {
  const { boardId } = useParams();
  const { user } = useAuth();
  const { boards, boardsLoading } = useWorkspace();
  const confirm = useConfirm();
  const toast = useToast();
  const [max, setMax] = useState(COMPLETED_PAGE_SIZE);
  const [selection, setSelection] = useState(() => new Set());
  const { data: tasks, loading, error } = useCompletedTasks(boardId, max);
  const { data: groups } = useGroups(boardId);

  const board = boards.find((candidate) => candidate.id === boardId);
  const canEdit = canEditBoard(board, user.uid);
  const groupsById = useMemo(() => Object.fromEntries((groups ?? []).map((g) => [g.id, g])), [groups]);
  const list = useMemo(() => tasks ?? [], [tasks]);

  // Itens removidos por outra pessoa saem da seleção sem precisar de efeito.
  const selectedTasks = list.filter((task) => selection.has(task.id));
  const allSelected = list.length > 0 && selectedTasks.length === list.length;

  const toggle = (id) =>
    setSelection((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const toggleAll = () => setSelection(allSelected ? new Set() : new Set(list.map((task) => task.id)));

  const restore = (task) =>
    restoreTask(boardId, user.uid, task).catch((restoreError) => toast.error(friendlyError(restoreError)));

  const remove = async (targets) => {
    const accepted = await confirm({
      title: targets.length === 1 ? 'Excluir tarefa?' : `Excluir ${targets.length} tarefas?`,
      message:
        targets.length === 1
          ? `“${targets[0].title}” será excluída definitivamente.`
          : 'As tarefas selecionadas serão excluídas definitivamente.',
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!accepted) return;
    try {
      await deleteTasks(boardId, targets.map((task) => task.id));
      setSelection(new Set());
    } catch (deleteError) {
      toast.error(friendlyError(deleteError));
    }
  };

  if (loading || boardsLoading) return <PageSpinner />;
  if (error || !board) {
    return (
      <EmptyState icon={Archive} title="Painel indisponível">
        Ele foi excluído ou você não tem mais acesso.
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
      <Link
        to={`/paineis/${boardId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {board.name}
      </Link>
      <h1 className="text-2xl font-semibold">Tarefas concluídas</h1>

      {list.length === 0 ? (
        <EmptyState icon={Archive} title="Nada concluído ainda">
          As tarefas finalizadas neste painel aparecem aqui.
        </EmptyState>
      ) : (
        <>
          {canEdit && (
            <div className="mt-4 flex min-h-9 items-center gap-3 px-3 sm:px-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink-soft">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-4 accent-(--accent)" />
                {selectedTasks.length > 0 ? `${selectedTasks.length} selecionada(s)` : 'Selecionar todas'}
              </label>
              {selectedTasks.length > 0 && (
                <Button variant="danger" size="sm" onClick={() => remove(selectedTasks)} className="ml-auto animate-fade">
                  <Trash2 aria-hidden className="size-3.5" />
                  Excluir selecionadas
                </Button>
              )}
            </div>
          )}
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface">
            {list.map((task) => (
              <CompletedRow
                key={task.id}
                task={task}
                group={groupsById[task.groupId]}
                canEdit={canEdit}
                selected={selection.has(task.id)}
                onToggle={toggle}
                onRestore={restore}
                onDelete={remove}
              />
            ))}
          </ul>
          {list.length === max && (
            <div className="mt-4 text-center">
              <Button onClick={() => setMax((current) => current + COMPLETED_PAGE_SIZE)}>Carregar mais</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
