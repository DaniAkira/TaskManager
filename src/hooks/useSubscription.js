import { useEffect, useState } from 'react';

/**
 * Liga um listener do Firestore ao ciclo de vida do componente.
 * `subscribe` precisa ser memoizado: cada nova referência reabre o listener.
 * Passe null para não assinar nada.
 */
export function useSubscription(subscribe) {
  const [state, setState] = useState({ source: null, data: null, error: null });

  useEffect(() => {
    if (!subscribe) return undefined;
    return subscribe(
      (data) => setState({ source: subscribe, data, error: null }),
      (error) => setState({ source: subscribe, data: null, error }),
    );
  }, [subscribe]);

  const isCurrent = state.source === subscribe;
  return {
    data: isCurrent ? state.data : null,
    error: isCurrent ? state.error : null,
    loading: Boolean(subscribe) && !isCurrent,
  };
}
