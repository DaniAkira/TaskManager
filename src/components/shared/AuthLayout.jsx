import { Logo } from '@/components/ui/Logo';

const SAMPLE_NOTES = [
  { text: 'Revisar contrato', tag: 'Vence hoje', color: '#f2c94c', position: 'top-[9%] left-[12%] -rotate-6' },
  { text: 'Enviar proposta ao cliente', tag: 'Urgente', color: '#f2854b', position: 'top-[28%] left-[46%] rotate-3' },
  { text: 'Regar as plantas', tag: 'Toda semana', color: '#72bf5b', position: 'top-[49%] left-[16%] rotate-2' },
];

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside aria-hidden className="relative hidden overflow-hidden border-r border-line bg-sunken lg:block">
        <p className="absolute right-12 bottom-12 left-12 max-w-md font-display text-4xl leading-tight font-semibold">
          Tudo o que precisa ser feito, à vista de todo mundo.
        </p>
        {SAMPLE_NOTES.map((note, index) => (
          <div
            key={note.text}
            style={{ '--group': note.color, animationDelay: `${index * 90}ms` }}
            className={`note absolute w-52 animate-pin ${note.position}`}
          >
            <div className="note-paper p-4 pb-6">
              <p className="font-display text-lg leading-snug font-semibold">{note.text}</p>
              <p className="mt-2 text-xs font-semibold text-ink-soft">{note.tag}</p>
            </div>
          </div>
        ))}
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm animate-rise">
          <Logo className="mb-8" />
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-1.5 mb-6 text-sm text-ink-soft">{subtitle}</p>
          {children}
          <p className="mt-6 text-sm text-ink-soft">{footer}</p>
        </div>
      </main>
    </div>
  );
}
