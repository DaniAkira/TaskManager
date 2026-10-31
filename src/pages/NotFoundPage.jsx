import { Link } from 'react-router-dom';
import { StickyNote } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={StickyNote}
      title="Nada pregado aqui"
      action={
        <Link to="/" className="font-semibold text-accent hover:text-accent-hover">
          Voltar para os painéis
        </Link>
      }
    >
      Esta página não existe ou foi movida.
    </EmptyState>
  );
}
