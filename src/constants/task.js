import { Ban, CheckCircle2, Circle, PauseCircle, PlayCircle } from 'lucide-react';

export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  BLOCKED: 'blocked',
  DONE: 'done',
};

export const STATUS_OPTIONS = [
  {
    value: STATUS.NOT_STARTED,
    label: 'Não iniciada',
    icon: Circle,
    tone: 'text-ink-soft',
    chip: 'bg-black/6 dark:bg-white/8',
  },
  {
    value: STATUS.IN_PROGRESS,
    label: 'Em andamento',
    icon: PlayCircle,
    tone: 'text-sky-800 dark:text-sky-300',
    chip: 'bg-sky-600/12 dark:bg-sky-400/15',
  },
  {
    value: STATUS.PAUSED,
    label: 'Pausada',
    icon: PauseCircle,
    tone: 'text-amber-800 dark:text-amber-300',
    chip: 'bg-amber-500/18 dark:bg-amber-400/15',
  },
  {
    value: STATUS.BLOCKED,
    label: 'Bloqueada',
    icon: Ban,
    tone: 'text-rose-800 dark:text-rose-300',
    chip: 'bg-rose-600/12 dark:bg-rose-400/15',
  },
  {
    value: STATUS.DONE,
    label: 'Finalizada',
    icon: CheckCircle2,
    tone: 'text-emerald-800 dark:text-emerald-300',
    chip: 'bg-emerald-600/12 dark:bg-emerald-400/15',
  },
];

export const ACTIVE_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s.value !== STATUS.DONE);

export const statusOption = (value) =>
  STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];

export const PRIORITY_OPTIONS = [
  {
    value: 1,
    label: 'Baixa',
    bar: 'bg-sky-600 dark:bg-sky-400',
    tone: 'text-sky-800 dark:text-sky-300',
    chip: 'bg-sky-600/12 dark:bg-sky-400/15',
    pulse: '[--pulse:var(--color-sky-500)] [--pulse-speed:3.4s]',
  },
  {
    value: 2,
    label: 'Média',
    bar: 'bg-amber-600 dark:bg-amber-400',
    tone: 'text-amber-900 dark:text-amber-300',
    chip: 'bg-amber-600/15 dark:bg-amber-400/15',
    pulse: '[--pulse:var(--color-amber-500)] [--pulse-speed:2.8s]',
  },
  {
    value: 3,
    label: 'Alta',
    // Sólida como a Urgente, mas em laranja vivo com texto escuro: não se confunde com a Média.
    bar: 'bg-orange-950',
    tone: 'text-orange-950',
    chip: 'bg-orange-500 dark:bg-orange-400',
    pulse: '[--pulse:var(--color-orange-500)] [--pulse-speed:2.1s]',
  },
  {
    value: 4,
    label: 'Urgente',
    bar: 'bg-white dark:bg-rose-950',
    tone: 'text-white dark:text-rose-950',
    chip: 'bg-rose-700 dark:bg-rose-400',
    pulse: '[--pulse:var(--color-rose-500)] [--pulse-speed:1.4s]',
  },
];

export const DEFAULT_PRIORITY = 2;

export const priorityOption = (value) =>
  PRIORITY_OPTIONS.find((p) => p.value === value) ?? PRIORITY_OPTIONS[1];

export const ON_COMPLETE = { ARCHIVE: 'archive', RESET: 'reset' };

export const ON_COMPLETE_OPTIONS = [
  {
    value: ON_COMPLETE.ARCHIVE,
    label: 'Concluir',
    hint: 'Sai do board e vai para Tarefas Concluídas.',
  },
  {
    value: ON_COMPLETE.RESET,
    label: 'Resetar',
    hint: 'Volta para “Não iniciada”, com o checklist desmarcado.',
  },
];
