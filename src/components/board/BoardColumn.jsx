import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
import { DROP_TYPE } from '@/hooks/useTaskDnd';
import { cn } from '@/utils/cn';
import { SortableTaskCard } from './TaskCard';

/**
 * Um grupo do board. Em `tile`, preenche o bloco da grade e o cabeçalho vira a alça
 * de arraste; sem ele, é uma coluna de largura fixa para a rolagem lateral do celular.
 */
export function BoardColumn({
  group,
  taskIds,
  tasksById,
  canEdit,
  tile = false,
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
      className={cn(
        'flex flex-col rounded-xl bg-sunken/70',
        tile ? 'h-full w-full' : 'max-h-full w-[17.5rem] shrink-0 snap-center',
      )}
    >
      <header
        className={cn(
          'flex items-center gap-2 px-3 pt-3 pb-2',
          tile && canEdit && 'group-drag-handle cursor-grab select-none active:cursor-grabbing',
        )}
      >
        {tile && canEdit && <GripVertical aria-hidden className="-ml-1 size-4 shrink-0 text-ink-faint" />}
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

      <SortableContext items={taskIds} strategy={rectSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={cn(
            // Post-its de 200 a 240px; em grupos mais estreitos que isso, eles encolhem junto.
            'grid min-h-24 flex-1 grid-cols-[repeat(auto-fill,minmax(min(12.5rem,100%),15rem))] content-start gap-2.5 overflow-y-auto rounded-b-xl px-2.5 pt-1 pb-3 transition-colors',
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
            <li className="col-span-full flex items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
              {canEdit ? 'Crie uma tarefa ou arraste uma para cá.' : 'Sem tarefas neste grupo.'}
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}
