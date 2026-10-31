import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/shared/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { requestPasswordReset } from '@/services/auth';
import { isValidEmail, normalizeEmail } from '@/utils/validators';

function SentNotice({ email, onRetry }) {
  return (
    <div role="status" className="flex animate-rise flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <MailCheck aria-hidden className="size-6 text-accent" />
      <p className="text-sm leading-relaxed wrap-anywhere">
        Se existir uma conta com <strong>{email}</strong>, você receberá um link para criar uma nova senha.
      </p>
      <p className="text-sm text-ink-soft">O e-mail pode demorar alguns minutos. Veja também o spam.</p>
      <Button onClick={onRetry} className="self-start">
        Tentar outro e-mail
      </Button>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email ?? '');
  const [sentTo, setSentTo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidEmail(email)) return setError('Informe um e-mail válido.');
    const normalized = normalizeEmail(email);
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(normalized);
      setSentTo(normalized);
    } catch (resetError) {
      setError(resetError.message);
    }
    setLoading(false);
    return undefined;
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para você criar uma nova senha."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
          Voltar para o login
        </Link>
      }
    >
      {sentTo ? (
        <SentNotice email={sentTo} onRetry={() => setSentTo(null)} />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Field label="E-mail" error={error}>
            {(control) => (
              <Input
                {...control}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </Field>
          <Button type="submit" variant="primary" loading={loading} className="mt-1">
            Enviar link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
