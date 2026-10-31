import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/hooks/useContexts';
import { cn } from '@/utils/cn';
import { BoardFormModal } from './BoardFormModal';

const linkClass = ({ isActive }) =>
  cn(
    'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition',
    isActive ? 'bg-sunken text-ink' : 'text-ink-soft hover:bg-sunken/70 hover:text-ink',
  );

export function BoardNav({ onNavigate }) {
  const { boards } = useWorkspace();
  const [creating, setCreating] = useState(false);

  return (
    <nav aria-label="Painéis" className="flex h-full flex-col gap-1 lg:overflow-y-auto lg:p-3">
      <NavLink to="/" end className={linkClass} onClick={onNavigate}>
        <LayoutGrid aria-hidden className="size-4" />
        Todos os painéis
      </NavLink>
      <p className="mt-4 mb-1 px-2.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">Painéis</p>
      {boards.map((board) => (
        <NavLink key={board.id} to={`/paineis/${board.id}`} className={linkClass} onClick={onNavigate}>
          <span className="min-w-0 flex-1 truncate">{board.name}</span>
          {board.memberIds.length > 1 && <Users aria-label="Compartilhado" className="size-3.5 shrink-0 opacity-60" />}
        </NavLink>
      ))}
      <Button variant="ghost" size="sm" onClick={() => setCreating(true)} className="mt-1 justify-start">
        <Plus aria-hidden className="size-4" />
        Novo painel
      </Button>
      {creating && <BoardFormModal onClose={() => setCreating(false)} onSaved={onNavigate} />}
    </nav>
  );
}
