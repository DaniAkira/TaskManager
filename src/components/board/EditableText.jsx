import { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Texto editável no próprio lugar. Salva ao sair do campo e, enquanto não há
 * rascunho, mostra o valor recebido em tempo real.
 */
export function EditableText({
  value,
  onSave,
  label,
  placeholder,
  maxLength,
  multiline = false,
  required = false,
  readOnly = false,
  className,
}) {
  const [draft, setDraft] = useState(null);
  const shown = draft ?? value;

  if (readOnly) {
    if (!value) return <p className="text-sm text-ink-faint">{placeholder}</p>;
    return <p className={cn('whitespace-pre-line wrap-anywhere', className)}>{value}</p>;
  }

  const commit = () => {
    if (draft === null) return;
    const next = draft.trim();
    setDraft(null);
    if (next === value || (required && !next)) return;
    onSave(next);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setDraft(null);
      event.currentTarget.blur();
    }
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <textarea
      aria-label={label}
      value={shown}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={multiline ? 3 : 1}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={cn(
        '-mx-2 w-[calc(100%+1rem)] resize-none rounded-md border border-transparent bg-transparent px-2 py-1 field-sizing-content transition placeholder:text-ink-faint hover:bg-sunken/60 focus:border-accent focus:bg-surface focus:outline-none',
        className,
      )}
    />
  );
}
