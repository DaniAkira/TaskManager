import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth, useToast } from '@/hooks/useContexts';
import { resendVerification } from '@/services/auth';

export function VerifyEmailBanner() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [checking, setChecking] = useState(false);

  if (user.emailVerified) return null;

  const resend = async () => {
    try {
      await resendVerification();
      toast.success(`Enviamos um novo link para ${user.email}.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const check = async () => {
    setChecking(true);
    await refreshUser().catch(() => toast.error('Não foi possível verificar agora.'));
    setChecking(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line bg-amber-200/50 px-4 py-2 text-sm dark:bg-amber-400/10">
      <MailCheck aria-hidden className="size-4 shrink-0" />
      <p className="min-w-0 flex-1 basis-60 wrap-anywhere">
        Confirme seu e-mail para receber convites. Enviamos o link para {user.email}; veja também o spam.
      </p>
      <div className="ml-auto flex gap-1.5">
        <Button variant="ghost" size="sm" onClick={resend}>
          Reenviar link
        </Button>
        <Button size="sm" loading={checking} onClick={check}>
          Já confirmei
        </Button>
      </div>
    </div>
  );
}
