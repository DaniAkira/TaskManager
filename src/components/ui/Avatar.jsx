import { initials } from '@/utils/board';
import { cn } from '@/utils/cn';

export function Avatar({ name, className }) {
  return (
    <span
      title={name}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xs font-semibold text-paper select-none',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ members, max = 4 }) {
  const hidden = members.length - max;
  return (
    <span className="flex -space-x-2">
      {members.slice(0, max).map((member) => (
        <Avatar key={member.uid} name={member.name} className="ring-2 ring-paper" />
      ))}
      {hidden > 0 && (
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-ink-soft ring-2 ring-paper">
          +{hidden}
        </span>
      )}
    </span>
  );
}
