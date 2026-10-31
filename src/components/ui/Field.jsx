import { useId } from 'react';
import { cn } from '@/utils/cn';

const CONTROL =
  'w-full rounded-lg border border-line bg-surface px-3 text-[15px] text-ink transition placeholder:text-ink-faint hover:border-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-60 sm:text-sm';

/** Rótulo + controle + erro. `children` recebe o id para ligar label e campo. */
export function Field({ label, error, hint, children, className }) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error || hint ? messageId : undefined,
      })}
      {(error || hint) && (
        <p id={messageId} className={cn('text-xs', error ? 'text-accent' : 'text-ink-faint')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(CONTROL, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(CONTROL, 'resize-y py-2 leading-relaxed', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(CONTROL, 'h-10', className)} {...props}>
      {children}
    </select>
  );
}
