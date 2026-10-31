import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useContexts';
import { useSubscription } from '@/hooks/useSubscription';
import { subscribeBoards } from '@/services/boards';
import { subscribeMyInvites } from '@/services/invites';
import { WorkspaceContext } from './contexts';

/**
 * Único listener de painéis e convites do app. Sidebar, dashboard e board leem
 * daqui em vez de abrir listeners próprios, o que evita leituras duplicadas.
 */
export function WorkspaceProvider({ children }) {
  const { user } = useAuth();

  const boardsSource = useCallback(
    (onData, onError) => subscribeBoards(user.uid, onData, onError),
    [user.uid],
  );

  // As Rules só liberam a leitura de convites depois que o e-mail é verificado.
  const invitesSource = useMemo(
    () =>
      user.emailVerified
        ? (onData, onError) => subscribeMyInvites(user.email, onData, onError)
        : null,
    [user.email, user.emailVerified],
  );

  const boards = useSubscription(boardsSource);
  const invites = useSubscription(invitesSource);

  const value = useMemo(
    () => ({
      boards: boards.data ?? [],
      boardsLoading: boards.loading,
      boardsError: boards.error,
      invites: invites.data ?? [],
      invitesError: invites.error,
    }),
    [boards, invites],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
