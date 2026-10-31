import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-sunken',
  ghost: 'text-ink-soft hover:bg-sunken hover:text-ink',
  danger: 'bg-rose-700 text-white hover:bg-rose-800 dark:bg-rose-400 dark:text-rose-950 dark:hover:bg-rose-300',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-2.5 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  icon: 'size-9',
};

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-semibold transition duration-150 active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
