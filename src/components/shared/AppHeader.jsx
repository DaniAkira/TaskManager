import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu as MenuIcon, Moon, Sun } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Menu } from '@/components/ui/Menu';
import { useAuth, useTheme, useWorkspace } from '@/hooks/useContexts';
import { signOut } from '@/services/auth';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      onClick={toggleTheme}
    >
      <Icon aria-hidden className="size-5 transition-transform duration-300 hover:rotate-12" />
    </Button>
  );
}

export function AppHeader({ onOpenNav }) {
  const { user } = useAuth();
  const { invites } = useWorkspace();
  const name = user.displayName || user.email;

  return (
    <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-line bg-surface/80 px-3 backdrop-blur-sm sm:px-4">
      <Button variant="ghost" size="icon" aria-label="Abrir painéis" onClick={onOpenNav} className="lg:hidden">
        <MenuIcon aria-hidden className="size-5" />
      </Button>
      <Link to="/" aria-label="Início">
        <Logo />
      </Link>
      <div className="flex-1" />
      <Link
        to="/"
        aria-label={`${invites.length} convite(s) pendente(s)`}
        className="relative flex size-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-sunken hover:text-ink"
      >
        <Bell aria-hidden className="size-5" />
        {invites.length > 0 && (
          <span className="absolute top-0.5 right-0.5 flex size-4 animate-pin items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-ink">
            {invites.length}
          </span>
        )}
      </Link>
      <ThemeToggle />
      <Menu
        label="Menu da conta"
        trigger={<Avatar name={name} />}
        triggerClassName="ml-1 rounded-full hover:bg-transparent"
        heading={
          <>
            <p className="truncate font-semibold text-ink">{name}</p>
            <p className="truncate">{user.email}</p>
          </>
        }
        items={[{ label: 'Sair', icon: LogOut, onSelect: signOut }]}
      />
    </header>
  );
}
