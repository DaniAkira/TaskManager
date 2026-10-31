import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/shared/AuthLayout';
import { PasswordInput, PasswordStrength } from '@/components/shared/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { LIMITS } from '@/constants/limits';
import { useAuth } from '@/hooks/useContexts';
import { signUp } from '@/services/auth';
import { isPasswordValid } from '@/utils/password';
import { isBlank, isValidEmail, normalizeEmail } from '@/utils/validators';

function validate({ name, email, password, confirmation }) {
  const errors = {};
  if (isBlank(name)) errors.name = 'Informe seu nome.';
  if (!isValidEmail(email)) errors.email = 'Informe um e-mail válido.';
  if (!isPasswordValid(password)) errors.password = 'A senha ainda não atende aos requisitos.';
  if (password !== confirmation) errors.confirmation = 'As senhas não coincidem.';
  return errors;
}

const EMPTY_FORM = { name: '', email: '', password: '', confirmation: '' };

export function SignupPage() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);
    try {
      await signUp({
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        password: form.password,
      });
      await refreshUser();
    } catch (signUpError) {
      setFormError(signUpError.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Seu primeiro mural está a um cadastro de distância."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Nome" error={errors.name}>
          {(control) => <Input {...control} {...bind('name')} autoComplete="name" maxLength={LIMITS.displayName} />}
        </Field>
        <Field label="E-mail" error={errors.email}>
          {(control) => <Input {...control} {...bind('email')} type="email" inputMode="email" autoComplete="email" />}
        </Field>
        <Field label="Senha" error={errors.password}>
          {(control) => (
            <>
              <PasswordInput {...control} {...bind('password')} autoComplete="new-password" />
              <PasswordStrength password={form.password} />
            </>
          )}
        </Field>
        <Field label="Confirme a senha" error={errors.confirmation}>
          {(control) => <PasswordInput {...control} {...bind('confirmation')} autoComplete="new-password" />}
        </Field>
        {formError && (
          <p role="alert" className="text-sm text-accent">
            {formError}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} className="mt-1">
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
