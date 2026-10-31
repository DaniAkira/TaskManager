import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ToastContext } from './contexts';

const TOAST_DURATION_MS = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const viewportRef = useRef(null);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (tone, message, action) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone, message, action }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  // Como popover, o toast entra na top layer e continua visível acima dos <dialog> abertos.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport.matches(':popover-open')) viewport.hidePopover();
    if (toasts.length > 0) viewport.showPopover();
  }, [toasts]);

  const value = useMemo(
    () => ({
      success: (message, action) => show('success', message, action),
      error: (message) => show('error', message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        ref={viewportRef}
        popover="manual"
        aria-live="polite"
        className="fixed inset-x-4 top-auto bottom-4 m-0 ml-auto flex w-auto max-w-sm flex-col gap-2 overflow-visible border-0 bg-transparent p-0 sm:right-4 sm:left-auto sm:w-full"
      >
        {toasts.map((toast) => {
          const Icon = toast.tone === 'error' ? CircleAlert : CheckCircle2;
          return (
            <div
              key={toast.id}
              role="status"
              className="flex animate-rise items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3 text-sm shadow-panel"
            >
              <Icon
                aria-hidden
                className={cn(
                  'size-4.5 shrink-0',
                  toast.tone === 'error' ? 'text-accent' : 'text-emerald-700 dark:text-emerald-300',
                )}
              />
              <p className="min-w-0 flex-1">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  className="shrink-0 font-semibold text-accent hover:text-accent-hover"
                  onClick={() => {
                    toast.action.onClick();
                    dismiss(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Fechar aviso"
                className="shrink-0 text-ink-faint hover:text-ink"
                onClick={() => dismiss(toast.id)}
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
