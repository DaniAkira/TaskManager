import { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { cn } from '@/utils/cn';
import { PASSWORD_RULES, STRENGTH_LEVELS, passwordScore } from '@/utils/password';

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className="pr-10" {...props} />
      <button
        type="button"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-faint transition hover:text-ink"
      >
        <Icon aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export function PasswordStrength({ password }) {
  const score = passwordScore(password);
  const level = STRENGTH_LEVELS[score];
  return (
    <div className="mt-2.5 space-y-2.5">
      <div className="flex items-center gap-2">
        <div aria-hidden className="grid flex-1 grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                'h-1 rounded-full transition-colors duration-200',
                password && score >= step ? level.tone : 'bg-sunken',
                password && score === 0 && step === 1 && level.tone,
              )}
            />
          ))}
        </div>
        <span className="w-20 text-right text-xs font-medium text-ink-soft" aria-live="polite">
          {password ? level.label : ''}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                met ? 'text-emerald-800 dark:text-emerald-300' : 'text-ink-faint',
              )}
            >
              <Check aria-hidden className={cn('size-3.5', !met && 'opacity-30')} />
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
