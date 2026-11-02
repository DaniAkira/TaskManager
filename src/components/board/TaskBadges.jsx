import { CalendarDays } from 'lucide-react';
import { priorityOption, statusOption } from '@/constants/task';
import { cn } from '@/utils/cn';
import { describeDueDate } from '@/utils/dates';

const DUE_TONES = {
  overdue: 'font-bold text-rose-800 dark:text-rose-300',
  today: 'font-bold text-orange-900 dark:text-orange-300',
  soon: 'font-semibold text-amber-900 dark:text-amber-300',
  later: 'text-ink-soft',
};

/**
 * Barras de sinal crescentes: lê-se o nível sem depender só da cor.
 * O pulso acelera conforme a prioridade sobe; em listas de escolha ele fica desligado.
 */
export function PriorityBadge({ value, animated = true, compact = false, className }) {
  const option = priorityOption(value);
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap',
        compact ? 'h-5.5 gap-1 px-1.5 text-[11px]' : 'h-6 gap-1.5 px-2 text-xs',
        option.chip,
        option.tone,
        animated && ['priority-pulse', option.pulse],
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
      {/* Em post-its estreitos, só as barras: o nome fica para leitores de tela. */}
      <span className={cn(compact && '@max-[13rem]:sr-only')}>{option.label}</span>
    </span>
  );
}

/** Mesmo visual no card, no gatilho do status e em cada opção do menu de status. */
export function StatusBadge({ value, className }) {
  const option = statusOption(value);
  const Icon = option.icon;
  return (
    <span
      className={cn(
        'inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap',
        option.chip,
        option.tone,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">{option.label}</span>
    </span>
  );
}

/** `compact` troca a frase pela forma curta; a frase completa fica na dica e no leitor de tela. */
export function DueBadge({ date, compact = false, className }) {
  if (!date) return null;
  const { label, short, urgency } = describeDueDate(date);
  return (
    <span
      title={label}
      aria-label={`Prazo: ${label}`}
      className={cn('inline-flex shrink-0 items-center gap-1 text-xs whitespace-nowrap', DUE_TONES[urgency], className)}
    >
      <CalendarDays aria-hidden className="size-3.5" />
      {compact ? short : label}
    </span>
  );
}
