import { ChevronDown } from 'lucide-react';
import { STATUS_OPTIONS, statusOption } from '@/constants/task';
import { cn } from '@/utils/cn';

const stop = (event) => event.stopPropagation();

// Dentro do card, interagir com o select não pode abrir o detalhe nem iniciar um drag.
const isolationHandlers = {
  onClick: stop,
  onMouseDown: stop,
  onTouchStart: stop,
  onKeyDown: stop,
};

export function StatusSelect({ value, onChange, disabled = false, className }) {
  const option = statusOption(value);
  const Icon = option.icon;

  if (disabled) {
    return (
      <span className={cn('inline-flex h-7 items-center gap-1.5 text-xs font-semibold', option.tone, className)}>
        <Icon aria-hidden className="size-3.5" />
        {option.label}
      </span>
    );
  }

  return (
    <span
      {...isolationHandlers}
      className={cn(
        'relative inline-flex h-7 items-center rounded-full bg-black/6 transition hover:bg-black/10 dark:bg-white/8 dark:hover:bg-white/14',
        option.tone,
        className,
      )}
    >
      <Icon aria-hidden className="pointer-events-none absolute left-2 size-3.5" />
      <select
        aria-label="Status da tarefa"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="select-chip h-full cursor-pointer rounded-full bg-transparent pr-6 pl-7 text-xs font-semibold focus:outline-none"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value} className="bg-surface text-ink">
            {status.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-1.5 size-3.5" />
    </span>
  );
}
