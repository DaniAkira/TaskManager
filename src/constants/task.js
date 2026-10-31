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
  },
  {
    value: STATUS.IN_PROGRESS,
    label: 'Em andamento',
    icon: PlayCircle,
    tone: 'text-sky-800 dark:text-sky-300',
  },
  {
    value: STATUS.PAUSED,
    label: 'Pausada',
    icon: PauseCircle,
    tone: 'text-amber-800 dark:text-amber-300',
  },
  {
    value: STATUS.BLOCKED,
    label: 'Bloqueada',
    icon: Ban,
    tone: 'text-rose-800 dark:text-rose-300',
  },
  {
    value: STATUS.DONE,
    label: 'Finalizada',
    icon: CheckCircle2,
    tone: 'text-emerald-800 dark:text-emerald-300',
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
  },
  {
    value: 2,
    label: 'Média',
    bar: 'bg-amber-600 dark:bg-amber-400',
    tone: 'text-amber-900 dark:text-amber-300',
    chip: 'bg-amber-600/15 dark:bg-amber-400/15',
  },
  {
    value: 3,
    label: 'Alta',
    bar: 'bg-orange-600 dark:bg-orange-400',
    tone: 'text-orange-900 dark:text-orange-300',
    chip: 'bg-orange-600/18 dark:bg-orange-400/20',
  },
  {
    value: 4,
    label: 'Urgente',
    bar: 'bg-white dark:bg-rose-950',
    tone: 'text-white dark:text-rose-950',
    chip: 'bg-rose-700 dark:bg-rose-400',
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
