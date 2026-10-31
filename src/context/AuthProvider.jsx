import { useCallback, useEffect, useMemo, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { AuthContext } from './contexts';

function toSessionUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email?.toLowerCase() ?? '',
    displayName: firebaseUser.displayName ?? '',
    emailVerified: firebaseUser.emailVerified,
  };
}

/**
 * Ao abrir o app, o SDK atualiza emailVerified, mas o token pode seguir antigo por até
 * uma hora. As Rules leem o token, então ele precisa acompanhar o perfil.
 */
async function syncVerifiedClaim(firebaseUser) {
  if (!firebaseUser?.emailVerified) return;
  const { claims } = await firebaseUser.getIdTokenResult();
  if (!claims.email_verified) await firebaseUser.getIdToken(true);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ user: null, loading: true });

  useEffect(
    () =>
      onIdTokenChanged(auth, async (firebaseUser) => {
        // Sem conexão a renovação falha, e o app segue com o token que tem.
        await syncVerifiedClaim(firebaseUser).catch(() => {});
        setSession({ user: toSessionUser(auth.currentUser), loading: false });
      }),
    [],
  );

  // O token precisa ser renovado: as Rules leem email_verified dele, não do cliente.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    setSession({ user: toSessionUser(auth.currentUser), loading: false });
  }, []);

  const value = useMemo(() => ({ ...session, refreshUser }), [session, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
