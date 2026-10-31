import { useState } from 'react';
import { Send, UserMinus, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { LIMITS } from '@/constants/limits';
import { useBoardInvites } from '@/hooks/useBoardData';
import { useAuth, useConfirm, useToast } from '@/hooks/useContexts';
import { removeMember, setMemberRole } from '@/services/boards';
import { cancelInvite, sendInvite } from '@/services/invites';
import { ROLE, ROLE_LABELS, isBoardOwner, membersOf } from '@/utils/board';
import { friendlyError } from '@/utils/errors';
import { isValidEmail, normalizeEmail } from '@/utils/validators';

function RoleOptions() {
  return [ROLE.EDITOR, ROLE.VIEWER].map((role) => (
    <option key={role} value={role}>
      {ROLE_LABELS[role]}
    </option>
  ));
}

function InviteForm({ board, sender }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLE.EDITOR);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) return setError('Informe um e-mail válido.');
    if (normalized === sender.email) return setError('Você já é o dono deste painel.');
    if (membersOf(board).some((member) => member.email === normalized)) {
      return setError('Esta pessoa já faz parte do painel.');
    }
    if (board.memberIds.length >= LIMITS.boardMembers) {
      return setError(`Um painel aceita até ${LIMITS.boardMembers} membros.`);
    }
    setError('');
    setEmail('');
    sendInvite({ board, email: normalized, role, sender })
      .then(() => toast.success(`Convite enviado para ${normalized}.`))
      .catch((inviteError) => toast.error(friendlyError(inviteError)));
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <Field label="Convidar por e-mail" error={error} className="flex-1">
        {(control) => (
          <Input
            {...control}
            type="email"
            inputMode="email"
            placeholder="pessoa@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>
      <Field label="Permissão" className="sm:w-36">
        {(control) => (
          <Select {...control} value={role} onChange={(event) => setRole(event.target.value)}>
            <RoleOptions />
          </Select>
        )}
      </Field>
      <Button type="submit" variant="primary" className="sm:mt-6.5">
        <Send aria-hidden className="size-4" />
        Convidar
      </Button>
    </form>
  );
}

function PendingInvites({ board, uid }) {
  const toast = useToast();
  const { data: invites } = useBoardInvites(board.id, uid);
  if (!invites?.length) return null;

  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-semibold">Convites pendentes</h3>
      <ul className="divide-y divide-line">
        {invites.map((invite) => (
          <li key={invite.id} className="flex items-center gap-2 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{invite.email}</p>
              <p className="text-xs text-ink-faint">{ROLE_LABELS[invite.role]}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Cancelar convite de ${invite.email}`}
              onClick={() =>
                cancelInvite(board.id, invite.email).catch((error) => toast.error(friendlyError(error)))
              }
            >
              <X aria-hidden className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MemberRow({ board, member, manageable }) {
  const confirm = useConfirm();
  const toast = useToast();
  const onError = (error) => toast.error(friendlyError(error));

  const remove = async () => {
    const accepted = await confirm({
      title: 'Remover membro?',
      message: `${member.name} perderá o acesso a “${board.name}”.`,
      confirmLabel: 'Remover',
      danger: true,
    });
    if (accepted) removeMember(board.id, member.uid).catch(onError);
  };

  return (
    <li className="flex items-center gap-2.5 py-2">
      <Avatar name={member.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.name}</p>
        <p className="truncate text-xs text-ink-faint">{member.email}</p>
      </div>
      {manageable ? (
        <>
          <Select
            aria-label={`Permissão de ${member.name}`}
            value={member.role}
            onChange={(event) => setMemberRole(board.id, member.uid, event.target.value).catch(onError)}
            className="h-8 w-32 text-[13px]"
          >
            <RoleOptions />
          </Select>
          <Button variant="ghost" size="icon" aria-label={`Remover ${member.name}`} onClick={remove}>
            <UserMinus aria-hidden className="size-4" />
          </Button>
        </>
      ) : (
        <span className="text-xs text-ink-soft">{ROLE_LABELS[member.role]}</span>
      )}
    </li>
  );
}

export function ShareBoardModal({ board, onClose }) {
  const { user } = useAuth();
  const isOwner = isBoardOwner(board, user.uid);

  return (
    <Modal open onClose={onClose} title={isOwner ? 'Compartilhar painel' : 'Membros do painel'} description={board.name}>
      {isOwner && <InviteForm board={board} sender={user} />}
      {isOwner && <PendingInvites board={board} uid={user.uid} />}
      <section className="mt-5">
        <h3 className="mb-1 text-sm font-semibold">Membros</h3>
        <ul className="divide-y divide-line">
          {membersOf(board).map((member) => (
            <MemberRow
              key={member.uid}
              board={board}
              member={member}
              manageable={isOwner && member.role !== ROLE.OWNER}
            />
          ))}
        </ul>
      </section>
    </Modal>
  );
}
