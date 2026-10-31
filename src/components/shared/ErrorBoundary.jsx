import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Algo saiu do lugar"
        action={
          <Button variant="primary" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        }
      >
        Não foi possível exibir esta tela. Recarregar costuma resolver.
      </EmptyState>
    );
  }
}
