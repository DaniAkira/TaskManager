import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { LIMITS } from '@/constants/limits';
import { useAuth, useToast } from '@/hooks/useContexts';
import { createBoard, updateBoard } from '@/services/boards';
import { friendlyError } from '@/utils/errors';
import { isBlank } from '@/utils/validators';

const FORM_ID = 'board-form';

export function BoardFormModal({ board, onClose, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(board?.name ?? '');
  const [description, setDescription] = useState(board?.description ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isBlank(name)) return setError('Dê um nome ao painel.');
    const values = { name: name.trim(), description: description.trim() };

    if (board) {
      updateBoard(board.id, values).catch((saveError) => toast.error(friendlyError(saveError)));
      onClose();
      return undefined;
    }

    setSaving(true);
    try {
      const boardId = await createBoard(user, values);
      onClose();
      onSaved?.();
      navigate(`/paineis/${boardId}`);
    } catch (saveError) {
      toast.error(friendlyError(saveError));
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={board ? 'Editar painel' : 'Novo painel'}
      description={board ? undefined : 'Por exemplo: Trabalho, Pessoal, Viagem.'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary" loading={saving}>
            {board ? 'Salvar' : 'Criar painel'}
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
              maxLength={LIMITS.boardName}
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>
        <Field label="Descrição (opcional)">
          {(control) => (
            <Textarea
              {...control}
              rows={3}
              value={description}
              maxLength={LIMITS.boardDescription}
              onChange={(event) => setDescription(event.target.value)}
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}
