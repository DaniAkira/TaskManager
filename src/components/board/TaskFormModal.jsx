import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { LIMITS } from '@/constants/limits';
import {
  ACTIVE_STATUS_OPTIONS,
  DEFAULT_PRIORITY,
  ON_COMPLETE,
  ON_COMPLETE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS,
  STATUS_OPTIONS,
} from '@/constants/task';
import { useAuth, useToast } from '@/hooks/useContexts';
import { createTask, updateTask } from '@/services/tasks';
import { cn } from '@/utils/cn';
import { friendlyError } from '@/utils/errors';
import { isBlank } from '@/utils/validators';
import { SubtaskList } from './SubtaskList';
import { PriorityBadge } from './TaskBadges';

const FORM_ID = 'task-form';

function initialValues(task, groupId) {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    note: task?.note ?? '',
    subtasks: task?.subtasks ?? [],
    dueDate: task?.dueDate ?? '',
    priority: task?.priority ?? DEFAULT_PRIORITY,
    onComplete: task?.onComplete ?? ON_COMPLETE.ARCHIVE,
    status: task?.status ?? STATUS.NOT_STARTED,
    groupId: task?.groupId ?? groupId,
  };
}

function toTaskFields(values) {
  return {
    ...values,
    title: values.title.trim(),
    description: values.description.trim(),
    note: values.note.trim(),
    dueDate: values.dueDate || null,
  };
}

function changedFields(next, task) {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(task[key])),
  );
}

function ChoiceCard({ selected, onSelect, name, children }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer rounded-lg border border-line p-2.5 transition hover:border-ink-faint',
        selected && 'border-accent ring-1 ring-accent',
      )}
    >
      <input type="radio" name={name} checked={selected} onChange={onSelect} className="sr-only" />
      {children}
    </label>
  );
}

export function TaskFormModal({ boardId, groups, groupId, task, actions, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(task, groupId));
  const [error, setError] = useState('');
  const set = (field) => (value) => setValues((current) => ({ ...current, [field]: value }));
  const fromEvent = (field) => (event) => set(field)(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isBlank(values.title)) return setError('Dê um título à tarefa.');
    const onError = (saveError) => toast.error(friendlyError(saveError));
    const fields = toTaskFields(values);

    if (!task) {
      createTask(boardId, user.uid, fields).catch(onError);
      onClose();
      return undefined;
    }

    // Finalizar passa pelo fluxo de status, que decide entre arquivar e resetar.
    const { status, ...rest } = changedFields(fields, task);
    if (Object.keys(rest).length > 0) updateTask(boardId, task.id, user.uid, rest).catch(onError);
    if (status) actions.changeStatus({ ...task, ...rest }, status);
    onClose();
    return undefined;
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? 'Editar tarefa' : 'Nova tarefa'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary">
            {task ? 'Salvar alterações' : 'Criar tarefa'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Título" error={error}>
          {(control) => (
            <Input {...control} data-autofocus value={values.title} maxLength={LIMITS.taskTitle} onChange={fromEvent('title')} />
          )}
        </Field>
        <Field label="Observação" hint="Aparece no post-it.">
          {(control) => (
            <Textarea {...control} rows={2} value={values.note} maxLength={LIMITS.taskNote} onChange={fromEvent('note')} />
          )}
        </Field>
        <Field label="Descrição">
          {(control) => (
            <Textarea
              {...control}
              rows={3}
              value={values.description}
              maxLength={LIMITS.taskDescription}
              onChange={fromEvent('description')}
            />
          )}
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">Subtarefas</p>
          <SubtaskList value={values.subtasks} onChange={set('subtasks')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prazo">
            {(control) => <Input {...control} type="date" value={values.dueDate} onChange={fromEvent('dueDate')} />}
          </Field>
          <Field label="Status">
            {(control) => (
              <Select {...control} value={values.status} onChange={fromEvent('status')}>
                {(task ? STATUS_OPTIONS : ACTIVE_STATUS_OPTIONS).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Grupo">
            {(control) => (
              <Select {...control} value={values.groupId} onChange={fromEvent('groupId')}>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Prioridade</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITY_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                name="priority"
                selected={values.priority === option.value}
                onSelect={() => set('priority')(option.value)}
              >
                <PriorityBadge value={option.value} />
              </ChoiceCard>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Ao finalizar</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ON_COMPLETE_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                name="onComplete"
                selected={values.onComplete === option.value}
                onSelect={() => set('onComplete')(option.value)}
              >
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="block text-xs text-ink-soft">{option.hint}</span>
                </span>
              </ChoiceCard>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
