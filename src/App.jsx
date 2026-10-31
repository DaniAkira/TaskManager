import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute, PublicRoute } from '@/components/shared/RouteGuards';
import { PageSpinner } from '@/components/ui/Spinner';
import { AuthProvider } from '@/context/AuthProvider';
import { ConfirmProvider } from '@/context/ConfirmProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';

const named = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));

const LoginPage = named(() => import('@/pages/LoginPage'), 'LoginPage');
const SignupPage = named(() => import('@/pages/SignupPage'), 'SignupPage');
const ForgotPasswordPage = named(() => import('@/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const BoardsPage = named(() => import('@/pages/BoardsPage'), 'BoardsPage');
const BoardPage = named(() => import('@/pages/BoardPage'), 'BoardPage');
const CompletedTasksPage = named(() => import('@/pages/CompletedTasksPage'), 'CompletedTasksPage');
const NotFoundPage = named(() => import('@/pages/NotFoundPage'), 'NotFoundPage');

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Suspense fallback={<PageSpinner />}>
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        <PublicRoute>
                          <LoginPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/cadastro"
                      element={
                        <PublicRoute>
                          <SignupPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/recuperar-senha"
                      element={
                        <PublicRoute>
                          <ForgotPasswordPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<BoardsPage />} />
                      <Route path="paineis/:boardId" element={<BoardPage />} />
                      <Route path="paineis/:boardId/concluidas" element={<CompletedTasksPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
