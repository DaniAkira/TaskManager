import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

/**
 * Usa <dialog> nativo: foco preso, Esc e top layer vêm do navegador.
 * No celular abre como folha inferior; a partir de `sm`, como janela centralizada.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', header }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      // O autoFocus do React roda antes do showModal, quando o <dialog> ainda não aceita foco.
      // Sem alvo explícito, o foco vai para Fechar para não abrir o teclado no celular.
      (dialog.querySelector('[data-autofocus]') ?? closeRef.current)?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'mx-auto mt-auto mb-0 w-full max-w-none overflow-hidden rounded-t-2xl border border-line bg-surface p-0 text-ink shadow-panel backdrop:bg-black/50 sm:m-auto sm:rounded-2xl',
        'open:animate-sheet',
        SIZES[size],
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col sm:max-h-[86dvh]">
          <header className="flex items-start gap-3 px-5 pt-5 pb-3">
            <div className="min-w-0 flex-1">
              {header ?? (
                <>
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
                </>
              )}
            </div>
            <Button ref={closeRef} variant="ghost" size="icon" aria-label="Fechar" onClick={onClose} className="-mt-1 -mr-1.5">
              <X aria-hidden className="size-5" />
            </Button>
          </header>
          {/* relative: mantém os campos sr-only dentro desta rolagem, e não na do <dialog>. */}
          <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}
