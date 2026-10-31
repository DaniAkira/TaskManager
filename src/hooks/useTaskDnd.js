import { useMemo, useState } from 'react';
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { applyTaskMoves } from '@/services/tasks';
import { friendlyError } from '@/utils/errors';
import { planMove } from '@/utils/ordering';
import { useAuth, useToast } from './useContexts';

export const DROP_TYPE = { BOARD: 'board', GROUP: 'group', TASK: 'task' };

const typeOf = (collision) => collision.data?.droppableContainer?.data?.current?.type;

/** Prioriza o que está sob o ponteiro; sem ponteiro (teclado), usa a distância. */
function collisionDetection(args) {
  const hits = pointerWithin(args);
  const target =
    hits.find((hit) => typeOf(hit) === DROP_TYPE.BOARD) ??
    hits.find((hit) => typeOf(hit) === DROP_TYPE.TASK) ??
    hits.find((hit) => typeOf(hit) === DROP_TYPE.GROUP);
  if (target) return [target];
  const droppableContainers = args.droppableContainers.filter(
    (container) => container.data.current?.type !== DROP_TYPE.BOARD,
  );
  return closestCorners({ ...args, droppableContainers });
}

function buildColumns(groups, tasks) {
  const columns = Object.fromEntries(groups.map((group) => [group.id, []]));
  [...tasks]
    .sort((a, b) => a.order - b.order)
    .forEach((task) => columns[task.groupId]?.push(task.id));
  return columns;
}

function columnOf(columns, id) {
  if (columns[id]) return id;
  return Object.keys(columns).find((groupId) => columns[groupId].includes(id));
}

export function useTaskDnd({ boardId, groups, tasks, onDropOnBoard }) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeId, setActiveId] = useState(null);
  // Durante o arraste as colunas ficam congeladas neste rascunho. Depois do drop ele vale
  // até o listener trazer a escrita local, para o card não piscar na posição antiga.
  const [draft, setDraft] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  );

  const tasksById = useMemo(
    () => Object.fromEntries(tasks.map((task) => [task.id, task])),
    [tasks],
  );
  const liveColumns = useMemo(() => buildColumns(groups, tasks), [groups, tasks]);
  const draftIsValid = draft && (activeId || draft.tasks === tasks);
  const columns = draftIsValid ? draft.columns : liveColumns;

  const finish = (nextDraft = null) => {
    setActiveId(null);
    setDraft(nextDraft);
  };

  const onDragStart = ({ active }) => {
    setActiveId(active.id);
    setDraft({ columns: liveColumns, tasks });
  };

  const onDragOver = ({ active, over }) => {
    if (!over || over.data.current?.type === DROP_TYPE.BOARD) return;
    setDraft((current) => {
      const from = columnOf(current.columns, active.id);
      const to = columnOf(current.columns, over.id);
      if (!from || !to || from === to) return current;
      const target = current.columns[to];
      const overIndex = target.indexOf(over.id);
      const index = overIndex === -1 ? target.length : overIndex;
      return {
        ...current,
        columns: {
          ...current.columns,
          [from]: current.columns[from].filter((id) => id !== active.id),
          [to]: [...target.slice(0, index), active.id, ...target.slice(index)],
        },
      };
    });
  };

  const onDragEnd = ({ active, over }) => {
    if (!over) return finish();
    if (over.data.current?.type === DROP_TYPE.BOARD) {
      onDropOnBoard(tasksById[active.id], over.data.current.board);
      return finish();
    }

    const groupId = columnOf(draft.columns, active.id);
    const ids = draft.columns[groupId];
    const fromIndex = ids.indexOf(active.id);
    const overIndex = ids.indexOf(over.id);
    const orderedIds = overIndex === -1 ? ids : arrayMove(ids, fromIndex, overIndex);

    const moves = planMove({ taskId: active.id, groupId, orderedIds, tasksById });
    if (moves.length === 0) return finish();

    finish({ columns: { ...draft.columns, [groupId]: orderedIds }, tasks });
    applyTaskMoves(boardId, user.uid, moves).catch((error) => toast.error(friendlyError(error)));
    return undefined;
  };

  return {
    columns,
    activeTask: activeId ? tasksById[activeId] : null,
    dndProps: {
      sensors,
      collisionDetection,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDragCancel: () => finish(),
    },
  };
}
