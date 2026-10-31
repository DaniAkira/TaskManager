import { useContext } from 'react';
import {
  AuthContext,
  ConfirmContext,
  ThemeContext,
  ToastContext,
  WorkspaceContext,
} from '@/context/contexts';

export const useAuth = () => useContext(AuthContext);
export const useTheme = () => useContext(ThemeContext);
export const useToast = () => useContext(ToastContext);
export const useConfirm = () => useContext(ConfirmContext);
export const useWorkspace = () => useContext(WorkspaceContext);
