import { Link } from 'react-router-dom';
import { Archive, LogOut, MoreHorizontal, Pencil, Plus, Share2, Trash2, Users } from 'lucide-react';
import { AvatarStack } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
import { useBoardActions } from '@/hooks/useBoardActions';
import { ROLE, membersOf, roleOf } from '@/utils/board';

export function BoardHeader({ board, uid, canEdit, onAddGroup, onShare, onEdit }) {
  const { removeBoard, leaveBoard } = useBoardActions();
  const isOwner = board.ownerId === uid;
  const isViewer = roleOf(board, uid) === ROLE.VIEWER;

  const menuItems = isOwner
    ? [
        { label: 'Editar painel', icon: Pencil, onSelect: onEdit },
        { label: 'Excluir painel', icon: Trash2, danger: true, onSelect: () => removeBoard(board) },
      ]
    : [{ label: 'Sair do painel', icon: LogOut, danger: true, onSelect: () => leaveBoard(board) }];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-2xl font-semibold">{board.name}</h1>
          {isViewer && (
            <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-xs font-semibold text-ink-soft">
              Somente leitura
            </span>
          )}
        </div>
        {board.description && <p className="truncate text-sm text-ink-soft">{board.description}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Ver membros" onClick={onShare} className="mr-1 rounded-full">
          <AvatarStack members={membersOf(board)} />
        </button>
        <Link
          to={`/paineis/${board.id}/concluidas`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[13px] font-semibold transition hover:bg-sunken"
        >
          <Archive aria-hidden className="size-4" />
          Concluídas
        </Link>
        <Button size="sm" onClick={onShare}>
          {isOwner ? <Share2 aria-hidden className="size-4" /> : <Users aria-hidden className="size-4" />}
          {isOwner ? 'Compartilhar' : 'Membros'}
        </Button>
        {canEdit && (
          <Button size="sm" variant="primary" onClick={onAddGroup}>
            <Plus aria-hidden className="size-4" />
            Grupo
          </Button>
        )}
        <Menu
          label="Opções do painel"
          trigger={<MoreHorizontal aria-hidden className="size-5" />}
          triggerClassName="size-8"
          items={menuItems}
        />
      </div>
    </div>
  );
}
