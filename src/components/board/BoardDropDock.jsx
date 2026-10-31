import { useDroppable } from '@dnd-kit/core';
import { ArrowRightLeft } from 'lucide-react';
import { DROP_TYPE } from '@/hooks/useTaskDnd';
import { cn } from '@/utils/cn';

function DockTarget({ board }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `board:${board.id}`,
    data: { type: DROP_TYPE.BOARD, board },
  });

  return (
    <li
      ref={setNodeRef}
      className={cn(
        'max-w-44 shrink-0 truncate rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold transition',
        isOver && 'scale-105 border-accent bg-accent text-accent-ink',
      )}
    >
      {board.name}
    </li>
  );
}

/** Aparece durante o arraste: soltar um card aqui o leva para outro painel, também no celular. */
export function BoardDropDock({ boards }) {
  if (boards.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-full animate-rise items-center gap-3 rounded-xl border border-line bg-surface p-2 pl-3 shadow-panel">
        <ArrowRightLeft aria-hidden className="size-4 shrink-0 text-ink-soft" />
        <span className="hidden shrink-0 text-sm text-ink-soft sm:inline">Mover para</span>
        <ul className="flex min-w-0 gap-2 overflow-x-auto">
          {boards.map((board) => (
            <DockTarget key={board.id} board={board} />
          ))}
        </ul>
      </div>
    </div>
  );
}
