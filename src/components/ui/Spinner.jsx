import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className }) {
  return <LoaderCircle aria-hidden className={cn('size-5 animate-spin', className)} />;
}

export function PageSpinner() {
  return (
    <div role="status" aria-label="Carregando" className="flex h-full min-h-48 items-center justify-center text-ink-faint">
      <Spinner className="size-6" />
    </div>
  );
}
