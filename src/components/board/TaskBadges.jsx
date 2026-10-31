import { CalendarDays } from 'lucide-react';
import { priorityOption } from '@/constants/task';
import { cn } from '@/utils/cn';
import { describeDueDate } from '@/utils/dates';

const DUE_TONES = {
  overdue: 'font-bold text-rose-800 dark:text-rose-300',
  today: 'font-bold text-orange-900 dark:text-orange-300',
  soon: 'font-semibold text-amber-900 dark:text-amber-300',
  later: 'text-ink-soft',
};

/** Barras de sinal crescentes: lê-se o nível sem depender só da cor. */
export function PriorityBadge({ value, className }) {
  const option = priorityOption(value);
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-semibold',
        option.chip,
        option.tone,
        className,
      )}
    >
      <span aria-hidden className="flex h-3 items-end gap-0.5">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            style={{ height: `${level * 25}%` }}
            className={cn('w-0.5 rounded-full', level <= option.value ? option.bar : 'bg-current opacity-20')}
          />
        ))}
      </span>
      {option.label}
    </span>
  );
}

export function DueBadge({ date, className }) {
  if (!date) return null;
  const { label, urgency } = describeDueDate(date);
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', DUE_TONES[urgency], className)}>
      <CalendarDays aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
