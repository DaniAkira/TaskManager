import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/shared/AuthLayout';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { signIn } from '@/services/auth';
import { isValidEmail, normalizeEmail } from '@/utils/validators';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidEmail(email)) return setError('Informe um e-mail válido.');
    if (!password) return setError('Informe sua senha.');
    setError('');
    setLoading(true);
    try {
      await signIn({ email: normalizeEmail(email), password });
    } catch (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    return undefined;
  };

  return (
    <AuthLayout
      title="Boas-vindas de volta"
      subtitle="Entre para ver seus painéis."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-accent hover:text-accent-hover">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="E-mail">
          {(control) => (
            <Input
              {...control}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </Field>
        <Field label="Senha">
          {(control) => (
            <PasswordInput
              {...control}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>
        <Link
          to="/recuperar-senha"
          state={{ email }}
          className="-mt-2 self-end text-sm font-semibold text-accent hover:text-accent-hover"
        >
          Esqueci minha senha
        </Link>
        {error && (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} className="mt-1">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
