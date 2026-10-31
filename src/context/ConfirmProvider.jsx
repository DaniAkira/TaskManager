import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmContext } from './contexts';

/** Toda confirmação do app passa por aqui: `await confirm({...})` resolve true ou false. */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setRequest(options);
      }),
    [],
  );

  const settle = (answer) => {
    resolverRef.current?.(answer);
    resolverRef.current = null;
    setRequest(null);
  };

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(request)}
        onClose={() => settle(false)}
        title={request?.title ?? ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>
              {request?.cancelLabel ?? 'Cancelar'}
            </Button>
            <Button
              variant={request?.danger ? 'danger' : 'primary'}
              onClick={() => settle(true)}
              data-autofocus
            >
              {request?.confirmLabel ?? 'Confirmar'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-soft">{request?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}
