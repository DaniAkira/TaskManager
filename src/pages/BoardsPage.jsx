import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, MoreHorizontal, Pencil, Plus, StickyNote, Trash2 } from 'lucide-react';
import { BoardFormModal } from '@/components/shared/BoardFormModal';
import { InviteList } from '@/components/shared/InviteList';
import { AvatarStack } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Menu } from '@/components/ui/Menu';
import { PageSpinner } from '@/components/ui/Spinner';
import { useBoardActions } from '@/hooks/useBoardActions';
import { useAuth, useWorkspace } from '@/hooks/useContexts';
import { ROLE_LABELS, isBoardOwner, membersOf, roleOf, tiltFor } from '@/utils/board';

function BoardCard({ board, index, onEdit }) {
  const { user } = useAuth();
  const { removeBoard, leaveBoard } = useBoardActions();
  const isOwner = isBoardOwner(board, user.uid);

  const items = isOwner
    ? [
        { label: 'Editar', icon: Pencil, onSelect: () => onEdit(board) },
        { label: 'Excluir', icon: Trash2, danger: true, onSelect: () => removeBoard(board) },
      ]
    : [{ label: 'Sair do painel', icon: LogOut, danger: true, onSelect: () => leaveBoard(board) }];

  return (
    <li
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms`, '--tilt': tiltFor(board.id) }}
      className="group relative flex min-h-40 animate-rise flex-col rounded-xl border border-line bg-surface p-4 shadow-note transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span aria-hidden className="absolute -top-1.5 left-5 size-3 rounded-full bg-accent shadow-note" />
      <div className="flex items-start gap-2">
        <h2 className="min-w-0 flex-1 text-lg leading-snug font-semibold">
          <Link to={`/paineis/${board.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {board.name}
          </Link>
        </h2>
        <div className="relative z-10">
          <Menu
            label={`Opções de ${board.name}`}
            trigger={<MoreHorizontal aria-hidden className="size-5" />}
            triggerClassName="size-8"
            items={items}
          />
        </div>
      </div>
      {board.description && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{board.description}</p>}
      <div className="mt-auto flex items-center justify-between pt-4">
        <AvatarStack members={membersOf(board)} />
        <span className="text-xs font-medium text-ink-faint">{ROLE_LABELS[roleOf(board, user.uid)]}</span>
      </div>
    </li>
  );
}

export function BoardsPage() {
  const { boards, boardsLoading } = useWorkspace();
  const [form, setForm] = useState(null);

  if (boardsLoading) return <PageSpinner />;

  const openCreate = () => setForm({ board: null });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <InviteList />
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Seus painéis</h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus aria-hidden className="size-4" />
          Novo painel
        </Button>
      </div>
      {boards.length === 0 ? (
        <EmptyState icon={StickyNote} title="Seu mural está em branco">
          Crie um painel para cada área da vida, como Trabalho ou Pessoal, e convide quem faz parte.
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {boards.map((board, index) => (
            <BoardCard key={board.id} board={board} index={index} onEdit={(target) => setForm({ board: target })} />
          ))}
        </ul>
      )}
      {form && <BoardFormModal board={form.board} onClose={() => setForm(null)} />}
    </div>
  );
}
