import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListChecks, Repeat } from 'lucide-react';
import { ON_COMPLETE } from '@/constants/task';
import { DROP_TYPE } from '@/hooks/useTaskDnd';
import { tiltFor } from '@/utils/board';
import { cn } from '@/utils/cn';
import { DueBadge, PriorityBadge } from './TaskBadges';
import { StatusSelect } from './StatusSelect';

export function TaskCard({ task, color, canEdit, onStatusChange, lifted = false }) {
  const doneSubtasks = task.subtasks.filter((subtask) => subtask.done).length;

  return (
    <div
      style={{ '--group': color, '--tilt': tiltFor(task.id) }}
      className={cn('note', lifted && 'note-lifted')}
    >
      <article className="note-paper flex flex-col gap-2 p-3 pb-4">
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge value={task.priority} />
          <DueBadge date={task.dueDate} />
        </div>
        <h3 className="font-display text-[15px] leading-snug font-semibold wrap-anywhere">{task.title}</h3>
        {task.note && (
          <p className="line-clamp-3 text-[13px] leading-relaxed whitespace-pre-line text-ink-soft wrap-anywhere">
            {task.note}
          </p>
        )}
        <div className="mt-0.5 flex items-center gap-2 pr-3">
          <StatusSelect
            value={task.status}
            disabled={!canEdit}
            onChange={(status) => onStatusChange(task, status)}
          />
          <span className="flex-1" />
          {task.onComplete === ON_COMPLETE.RESET && (
            <Repeat aria-label="Tarefa recorrente" className="size-3.5 text-ink-soft" />
          )}
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft tabular-nums">
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
