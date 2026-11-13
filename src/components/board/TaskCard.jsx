import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListChecks, Repeat } from 'lucide-react';
import { ON_COMPLETE } from '@/constants/task';
import { DROP_TYPE } from '@/hooks/useTaskDnd';
import { tiltFor } from '@/utils/board';
import { cn } from '@/utils/cn';
import { RichTextView } from './RichTextView';
import { DueBadge, PriorityBadge, TaskAge } from './TaskBadges';
import { StatusSelect } from './StatusSelect';

// Pegar a barra de rolagem da descrição não pode iniciar o arraste do post-it.
function keepScrollbarFromDragging(event) {
  if (event.nativeEvent.offsetX >= event.currentTarget.clientWidth) event.stopPropagation();
}

export function TaskCard({ task, color, canEdit, onStatusChange, lifted = false }) {
  const doneSubtasks = task.subtasks.filter((subtask) => subtask.done).length;

  return (
    <div
      style={{ '--group': color, '--tilt': tiltFor(task.id) }}
      className={cn('note', lifted && 'note-lifted')}
    >
      {/*
        Altura igual para todos e proporcional à tela: prioridade e status na primeira linha,
        o título em uma linha só, a descrição rola no que sobra e o rodapé reúne tempo e prazos.
      */}
      <article className="note-paper @container flex h-[clamp(7.75rem,15.5vh,9.5rem)] flex-col gap-1.5 p-2.5 pb-3">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <PriorityBadge compact value={task.priority} />
          <StatusSelect
            compact
            value={task.status}
            disabled={!canEdit}
            onChange={(status) => onStatusChange(task, status)}
          />
        </div>
        <h3 title={task.title} className="shrink-0 truncate font-display text-[14px] leading-tight font-semibold">
          {task.title}
        </h3>
        <div
          onMouseDown={keepScrollbarFromDragging}
          className="-mr-1.5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-3 text-[12.5px] leading-normal text-ink-soft [scrollbar-width:thin]"
        >
          <RichTextView plainLinks value={task.note} className="rich-text-compact" />
        </div>
        {/* pr-5: o canto dobrado do post-it ocupa a ponta direita do rodapé. */}
        <div className="flex shrink-0 items-center gap-1.5 pr-5 text-[11px] font-medium text-ink-soft">
          <TaskAge createdAt={task.createdAt} />
          <span className="flex-1" />
          <DueBadge compact date={task.dueDate} className="text-[11px]" />
          {task.onComplete === ON_COMPLETE.RESET && (
            <Repeat aria-label="Tarefa recorrente" className="size-3.5 shrink-0" />
          )}
          {task.subtasks.length > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 tabular-nums @max-[13rem]:hidden">
              <ListChecks aria-hidden className="size-3.5" />
              {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
        </div>
      </article>
    </div>
  );
}

export function SortableTaskCard({ task, color, canEdit, onOpen, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit,
    data: { type: DROP_TYPE.TASK },
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('animate-pin rounded', isDragging && 'opacity-30')}
    >
      <div
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label={`Abrir tarefa ${task.title}`}
        onClick={() => onOpen(task.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onOpen(task.id);
          listeners?.onKeyDown?.(event);
        }}
        className="touch-manipulation rounded select-none"
      >
        <TaskCard task={task} color={color} canEdit={canEdit} onStatusChange={onStatusChange} />
      </div>
    </li>
  );
}
