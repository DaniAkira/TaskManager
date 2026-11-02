import { useId, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { STATUS_OPTIONS, statusOption } from '@/constants/task';
import { cn } from '@/utils/cn';
import { placePopover } from '@/utils/popover';
import { StatusBadge } from './TaskBadges';

const MENU_WIDTH = 184;
const MENU_HEIGHT = STATUS_OPTIONS.length * 36 + 12;

const stop = (event) => event.stopPropagation();

// Dentro do card, interagir com o status não pode abrir o detalhe nem iniciar um drag.
const isolationHandlers = {
  onClick: stop,
  onMouseDown: stop,
  onTouchStart: stop,
  onKeyDown: stop,
};

function focusOption(list, index) {
  const options = [...list.querySelectorAll('[role="menuitemradio"]')];
  options[(index + options.length) % options.length]?.focus();
}

/**
 * Menu próprio em vez de <select>: as opções nativas não aceitam estilo, e aqui cada
 * opção aparece como a própria badge do status.
 */
export function StatusSelect({ value, onChange, disabled = false, compact = false, className }) {
  const id = useId();
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const option = statusOption(value);

  if (disabled) return <StatusBadge value={value} className={cn(compact && 'h-6 gap-1 px-2 text-[11px]', className)} />;

  const choose = (status) => {
    listRef.current.hidePopover();
    triggerRef.current.focus();
    onChange(status);
  };

  const handleToggle = (event) => {
    if (event.newState !== 'open') return;
    focusOption(listRef.current, STATUS_OPTIONS.findIndex((status) => status.value === value));
  };

  const handleKeyDown = (event) => {
    const options = [...listRef.current.querySelectorAll('[role="menuitemradio"]')];
    const current = options.indexOf(document.activeElement);
    const moves = { ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: options.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    focusOption(listRef.current, moves[event.key]);
  };

  return (
    <span {...isolationHandlers} className={cn('inline-flex min-w-0', className)}>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={id}
        aria-haspopup="menu"
        aria-label={`Status: ${option.label}. Alterar status`}
        onClick={(event) => placePopover(listRef.current, event.currentTarget, { width: MENU_WIDTH, height: MENU_HEIGHT, align: 'start' })}
        className={cn(
          'inline-flex max-w-full min-w-0 items-center rounded-full font-semibold whitespace-nowrap transition hover:brightness-95 dark:hover:brightness-125',
          compact ? 'h-6 gap-1 pr-1 pl-2 text-[11px]' : 'h-7 gap-1.5 pr-1.5 pl-2.5 text-xs',
          option.chip,
          option.tone,
        )}
      >
        <option.icon aria-hidden className="size-3.5 shrink-0" />
        {/* Em post-its estreitos o nome é cortado; o ícone e a cor seguem identificando. */}
        <span className="truncate">{option.label}</span>
        <ChevronDown aria-hidden className="size-3.5 shrink-0 opacity-70" />
      </button>
      <div
        ref={listRef}
        id={id}
        popover="auto"
        role="menu"
        aria-label="Status da tarefa"
        onToggle={handleToggle}
        onKeyDown={handleKeyDown}
        style={{ width: MENU_WIDTH }}
        // Só "open:flex": um display fixo sobrescreveria o display:none do popover fechado.
        className="fixed right-auto bottom-auto m-0 flex-col gap-0.5 rounded-xl border border-line bg-surface p-1.5 text-ink shadow-panel open:flex"
      >
        {STATUS_OPTIONS.map((status) => {
          const selected = status.value === value;
          return (
            <button
              key={status.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => choose(status.value)}
              className="flex h-8.5 items-center justify-between gap-2 rounded-lg px-1 transition hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none"
            >
              <StatusBadge value={status.value} />
              {selected && <Check aria-hidden className="mr-1 size-4 text-ink-soft" />}
            </button>
          );
        })}
      </div>
    </span>
  );
}
