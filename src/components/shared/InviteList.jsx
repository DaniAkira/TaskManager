import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth, useToast, useWorkspace } from '@/hooks/useContexts';
import { acceptInvite, declineInvite } from '@/services/invites';
import { ROLE_LABELS } from '@/utils/board';
import { friendlyError } from '@/utils/errors';

export function InviteList() {
  const { user } = useAuth();
  const { invites, invitesError } = useWorkspace();
  const toast = useToast();

  if (invitesError) {
    return (
      <p role="alert" className="mb-6 text-sm text-accent">
        Não foi possível carregar seus convites. Recarregue a página para tentar de novo.
      </p>
    );
  }

  if (invites.length === 0) return null;

  // Sem navegar: o painel chega pelo listener logo depois do ack, e abrir a rota
  // antes disso mostraria "indisponível" por um instante.
  const accept = (invite) =>
    acceptInvite(invite, user)
      .then(() => toast.success(`Você entrou em “${invite.boardName}”.`))
      .catch((error) => toast.error(friendlyError(error)));

  return (
    <section aria-label="Convites pendentes" className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">Convites para você</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex animate-pin flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-note"
          >
            <div className="min-w-40 flex-1">
              <p className="font-display font-semibold">{invite.boardName}</p>
              <p className="text-xs text-ink-soft">
                {invite.invitedByName} · {ROLE_LABELS[invite.role]}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => declineInvite(invite).catch((error) => toast.error(friendlyError(error)))}
              >
                <X aria-hidden className="size-3.5" />
                Recusar
              </Button>
              <Button size="sm" variant="primary" onClick={() => accept(invite)}>
                <Check aria-hidden className="size-3.5" />
                Aceitar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
