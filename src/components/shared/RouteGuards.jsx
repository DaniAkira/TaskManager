import { Navigate, useLocation } from 'react-router-dom';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useContexts';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;
  if (user) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;
  return children;
}
