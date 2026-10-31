import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Field, Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { DEFAULT_GROUP_COLOR } from '@/constants/colors';
import { LIMITS } from '@/constants/limits';
import { useAuth, useToast } from '@/hooks/useContexts';
import { createGroup, updateGroup } from '@/services/groups';
import { friendlyError } from '@/utils/errors';
import { isBlank } from '@/utils/validators';

const FORM_ID = 'group-form';

export function GroupFormModal({ boardId, group, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(group?.name ?? '');
  const [color, setColor] = useState(group?.color ?? DEFAULT_GROUP_COLOR);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isBlank(name)) return setError('Dê um nome ao grupo.');
    const values = { name: name.trim(), color };
    const write = group ? updateGroup(boardId, group.id, values) : createGroup(boardId, user.uid, values);
    write.catch((saveError) => toast.error(friendlyError(saveError)));
    onClose();
    return undefined;
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={group ? 'Editar grupo' : 'Novo grupo'}
      description="Todas as tarefas do grupo herdam esta cor."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary">
            {group ? 'Salvar' : 'Criar grupo'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Nome" error={error}>
          {(control) => (
            <Input
              {...control}
              data-autofocus
              value={name}
              maxLength={LIMITS.groupName}
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">Cor</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </form>
    </Modal>
  );
}
