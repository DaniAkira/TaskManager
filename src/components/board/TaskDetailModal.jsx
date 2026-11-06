import { useState } from 'react';
import { ArrowRightLeft, Pencil, Repeat, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LIMITS } from '@/constants/limits';
import { ON_COMPLETE_OPTIONS } from '@/constants/task';
import { formatFullDate } from '@/utils/dates';
import { EditableText } from './EditableText';
import { StatusSelect } from './StatusSelect';
import { SubtaskList } from './SubtaskList';
import { PriorityBadge } from './TaskBadges';
import { TaskFormModal } from './TaskFormModal';

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-1 font-sans text-xs font-semibold tracking-wide text-ink-faint uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Setting({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/**
 * Título, descrição, observação, status e subtarefas são editados aqui mesmo.
 * Prazo, prioridade, grupo e comportamento ao finalizar exigem o botão "Editar tarefa".
 */
export function TaskDetailModal({ task, group, groups, boardId, canEdit, actions, onClose, onMove }) {
  const [editing, setEditing] = useState(false);
  const onCompleteLabel = ON_COMPLETE_OPTIONS.find((option) => option.value === task.onComplete)?.label;
  const save = (field) => (value) => actions.saveFields(task, { [field]: value });

  const remove = async () => {
    const removed = await actions.removeTask(task);
    if (removed) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={task.title}
      size="lg"
      header={
        <div style={{ '--group': group.color }}>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <span aria-hidden className="size-2.5 rounded-[3px] bg-(--group)" />
            {group.name}
          </p>
          <EditableText
            label="Título"
            value={task.title}
            required
            readOnly={!canEdit}
            maxLength={LIMITS.taskTitle}
            onSave={save('title')}
            className="font-display text-xl leading-snug font-semibold"
          />
        </div>
      }
      footer={
        canEdit && (
          <>
            <Button variant="ghost" onClick={remove} className="mr-auto text-rose-700 dark:text-rose-300">
              <Trash2 aria-hidden className="size-4" />
              Excluir
            </Button>
            <Button onClick={() => onMove(task)}>
              <ArrowRightLeft aria-hidden className="size-4" />
              Mover para…
            </Button>
            <Button variant="primary" onClick={() => setEditing(true)}>
              <Pencil aria-hidden className="size-4" />
              Editar tarefa
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-sunken/60 p-3 sm:grid-cols-4">
          <Setting label="Status">
            <StatusSelect
              value={task.status}
              disabled={!canEdit}
              onChange={(status) => actions.changeStatus(task, status)}
            />
          </Setting>
          <Setting label="Prioridade">
            <PriorityBadge value={task.priority} />
          </Setting>
          <Setting label="Prazo">{task.dueDate ? formatFullDate(task.dueDate) : 'Sem prazo'}</Setting>
          <Setting label="Ao finalizar">
            <span className="inline-flex items-center gap-1">
              {task.onComplete === 'reset' && <Repeat aria-hidden className="size-3.5" />}
              {onCompleteLabel}
            </span>
          </Setting>
        </dl>

        {/* "note" aparece como Descrição (é o texto do post-it); "description", como Observação. */}
        <Section title="Descrição">
          <EditableText
            multiline
            label="Descrição"
            value={task.note}
            placeholder={canEdit ? 'Adicione uma descrição' : 'Sem descrição'}
            readOnly={!canEdit}
            maxLength={LIMITS.taskNote}
            onSave={save('note')}
            className="text-sm leading-relaxed"
          />
        </Section>

        <Section title="Observação">
          <EditableText
            multiline
            label="Observação"
            value={task.description}
            placeholder={canEdit ? 'Adicione uma observação' : 'Sem observação'}
            readOnly={!canEdit}
            maxLength={LIMITS.taskDescription}
            onSave={save('description')}
            className="text-sm leading-relaxed"
          />
        </Section>

        <Section title="Subtarefas">
          {!canEdit && task.subtasks.length === 0 && <p className="text-sm text-ink-faint">Sem subtarefas</p>}
          <SubtaskList value={task.subtasks} readOnly={!canEdit} onChange={save('subtasks')} />
        </Section>
      </div>

      {editing && (
        <TaskFormModal
          boardId={boardId}
          groups={groups}
          task={task}
          actions={actions}
          onClose={() => setEditing(false)}
        />
      )}
    </Modal>
  );
}
