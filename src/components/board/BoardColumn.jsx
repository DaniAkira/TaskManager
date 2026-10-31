import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
import { DROP_TYPE } from '@/hooks/useTaskDnd';
import { cn } from '@/utils/cn';
import { SortableTaskCard } from './TaskCard';

export function BoardColumn({
  group,
  taskIds,
  tasksById,
  canEdit,
  onOpenTask,
  onStatusChange,
  onAddTask,
  onEditGroup,
  onDeleteGroup,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
    disabled: !canEdit,
    data: { type: DROP_TYPE.GROUP },
  });

  return (
    <section
      aria-label={`Grupo ${group.name}`}
      className="flex max-h-full w-[84vw] max-w-80 shrink-0 snap-center flex-col rounded-xl bg-sunken/70 sm:w-76"
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span aria-hidden style={{ backgroundColor: group.color }} className="size-3 shrink-0 rounded-[3px] shadow-note" />
        <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{group.name}</h2>
        <span className="text-xs font-semibold text-ink-faint tabular-nums">{taskIds.length}</span>
        {canEdit && (
          <>
            <Button variant="ghost" size="icon" aria-label={`Nova tarefa em ${group.name}`} onClick={() => onAddTask(group.id)} className="size-7">
              <Plus aria-hidden className="size-4" />
            </Button>
            <Menu
              label={`Opções do grupo ${group.name}`}
              trigger={<MoreHorizontal aria-hidden className="size-4" />}
              triggerClassName="size-7"
              items={[
                { label: 'Editar grupo', icon: Pencil, onSelect: () => onEditGroup(group) },
                { label: 'Excluir grupo', icon: Trash2, danger: true, onSelect: () => onDeleteGroup(group) },
              ]}
            />
          </>
        )}
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={cn(
            'flex min-h-24 flex-1 flex-col gap-2.5 overflow-y-auto rounded-b-xl px-2.5 pt-1 pb-3 transition-colors',
            isOver && 'bg-accent/8',
          )}
        >
          {taskIds.map((taskId) => (
            <SortableTaskCard
              key={taskId}
              task={tasksById[taskId]}
              color={group.color}
              canEdit={canEdit}
              onOpen={onOpenTask}
              onStatusChange={onStatusChange}
            />
          ))}
          {taskIds.length === 0 && (
            <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
              {canEdit ? 'Crie uma tarefa ou arraste uma para cá.' : 'Sem tarefas neste grupo.'}
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}
