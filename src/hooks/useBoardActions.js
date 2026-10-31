import { useNavigate } from 'react-router-dom';
import { deleteBoard, removeMember } from '@/services/boards';
import { friendlyError } from '@/utils/errors';
import { useAuth, useConfirm, useToast } from './useContexts';

export function useBoardActions() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const navigate = useNavigate();

  const removeBoard = async (board) => {
    const accepted = await confirm({
      title: 'Excluir painel?',
      message: `“${board.name}”, com todos os grupos e tarefas, será excluído para todos os membros. Não há como desfazer.`,
      confirmLabel: 'Excluir painel',
      danger: true,
    });
    if (!accepted) return;
    try {
      await deleteBoard(board.id, board.ownerId);
      navigate('/');
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const leaveBoard = async (board) => {
    const accepted = await confirm({
      title: 'Sair do painel?',
      message: `Você perderá o acesso a “${board.name}” até receber um novo convite.`,
      confirmLabel: 'Sair',
      danger: true,
    });
    if (!accepted) return;
    try {
      await removeMember(board.id, user.uid);
      navigate('/');
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return { removeBoard, leaveBoard };
}
