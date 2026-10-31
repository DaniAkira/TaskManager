import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { WorkspaceProvider } from '@/context/WorkspaceProvider';
import { AppHeader } from './AppHeader';
import { BoardNav } from './BoardNav';
import { ErrorBoundary } from './ErrorBoundary';
import { VerifyEmailBanner } from './VerifyEmailBanner';

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <WorkspaceProvider>
      <div className="flex h-dvh flex-col">
        <AppHeader onOpenNav={() => setNavOpen(true)} />
        <VerifyEmailBanner />
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-64 shrink-0 border-r border-line bg-surface/60 lg:block">
            <BoardNav />
          </aside>
          <main className="min-w-0 flex-1 overflow-y-auto">
            <ErrorBoundary key={pathname}>
              <Suspense fallback={<PageSpinner />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <Modal open={navOpen} onClose={() => setNavOpen(false)} title="Painéis" size="sm">
        <BoardNav onNavigate={() => setNavOpen(false)} />
      </Modal>
    </WorkspaceProvider>
  );
}
