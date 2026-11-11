import { Suspense, lazy, useId } from 'react';
import { cn } from '@/utils/cn';

const RichTextEditor = lazy(() => import('./RichTextEditor'));

function EditorFallback({ minHeight = 'min-h-24' }) {
  return <div aria-hidden className={cn('animate-pulse rounded-lg border border-line bg-sunken/60', minHeight)} />;
}

/** Rótulo, editor e mensagem, como o Field, mas ligados por aria-labelledby (contenteditable não aceita htmlFor). */
export function RichTextField({ label, hint, error, minHeight, ...editorProps }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <p id={`${id}-label`} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </p>
      <Suspense fallback={<EditorFallback minHeight={minHeight} />}>
        <RichTextEditor
          label={label}
          labelledBy={`${id}-label`}
          minHeight={minHeight}
          invalid={Boolean(error)}
          {...editorProps}
        />
      </Suspense>
      {(error || hint) && <p className={cn('text-xs', error ? 'text-accent' : 'text-ink-faint')}>{error || hint}</p>}
    </div>
  );
}

/** Edição no próprio lugar (detalhe da tarefa): a barra de formatação aparece só ao editar. */
export function RichTextInline({ minHeight = 'min-h-10', ...editorProps }) {
  return (
    <Suspense fallback={<EditorFallback minHeight={minHeight} />}>
      <RichTextEditor toolbar="focus" minHeight={minHeight} {...editorProps} />
    </Suspense>
  );
}
