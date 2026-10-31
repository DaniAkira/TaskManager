import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LIMITS } from '@/constants/limits';
import { cn } from '@/utils/cn';
import { isBlank } from '@/utils/validators';

/** Usada no detalhe (salva a cada mudança) e no formulário (salva ao enviar). */
export function SubtaskList({ value, onChange, readOnly = false }) {
  const [draft, setDraft] = useState('');
  const done = value.filter((subtask) => subtask.done).length;
  const full = value.length >= LIMITS.subtasks;

  const add = () => {
    if (isBlank(draft) || full) return;
    onChange([...value, { id: crypto.randomUUID(), title: draft.trim(), done: false }]);
    setDraft('');
  };

  const toggle = (id) =>
    onChange(value.map((subtask) => (subtask.id === id ? { ...subtask, done: !subtask.done } : subtask)));

  const remove = (id) => onChange(value.filter((subtask) => subtask.id !== id));

  return (
    <div>
      {value.length > 0 && (
        <div aria-hidden className="mb-2 h-1 overflow-hidden rounded-full bg-sunken">
          <div
            style={{ width: `${(done / value.length) * 100}%` }}
            className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 dark:bg-emerald-400"
          />
        </div>
      )}
      <ul className="flex flex-col">
        {value.map((subtask) => (
          <li key={subtask.id} className="group flex items-center gap-2.5 rounded-md py-1.5">
            <label className={cn('flex min-w-0 flex-1 items-center gap-2.5', !readOnly && 'cursor-pointer')}>
              <input
                type="checkbox"
                checked={subtask.done}
                disabled={readOnly}
                onChange={() => toggle(subtask.id)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md border border-ink-faint transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent',
                  subtask.done && 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-emerald-950',
                )}
              >
                {subtask.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className={cn('min-w-0 text-sm wrap-anywhere transition-colors', subtask.done && 'text-ink-faint line-through')}>
                {subtask.title}
              </span>
            </label>
            {!readOnly && (
              <button
                type="button"
                aria-label={`Remover subtarefa ${subtask.title}`}
                onClick={() => remove(subtask.id)}
                className="text-ink-faint opacity-60 transition hover:text-accent hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && !full && (
        <div className="mt-1.5 flex gap-2">
          <Input
            aria-label="Nova subtarefa"
            placeholder="Adicionar subtarefa"
            value={draft}
            maxLength={LIMITS.subtaskTitle}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              add();
            }}
            className="h-9"
          />
          <Button size="icon" aria-label="Adicionar subtarefa" onClick={add} disabled={isBlank(draft)}>
            <Plus aria-hidden className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
