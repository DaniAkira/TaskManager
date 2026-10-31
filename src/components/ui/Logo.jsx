import { cn } from '@/utils/cn';

export function Logo({ className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight', className)}>
      <span aria-hidden className="relative size-6 -rotate-6 rounded-[3px] bg-[#f2c94c] shadow-note">
        <span className="absolute top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-accent" />
      </span>
      Mural
    </span>
  );
}
