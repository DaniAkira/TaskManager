// O prazo é uma data de calendário (YYYY-MM-DD), sem hora: guardar como Timestamp
// faria o dia mudar para quem está em outro fuso horário.
const MS_PER_DAY = 86_400_000;
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const numericDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const fullDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function parseLocalDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysUntil(isoDate, now = new Date()) {
  return Math.round((parseLocalDate(isoDate) - startOfDay(now)) / MS_PER_DAY);
}

/** Resumo do prazo para o card. `urgency` define a cor do selo. */
export function describeDueDate(isoDate, now = new Date()) {
  const days = daysUntil(isoDate, now);
  const date = shortDate.format(parseLocalDate(isoDate)).replace('.', '');
  // `short` cabe no rodapé do post-it ao lado do tempo de criação: "20/11".
  const numeric = numericDate.format(parseLocalDate(isoDate));
  if (days < 0) return { label: `Atrasada · ${date}`, short: numeric, urgency: 'overdue' };
  if (days === 0) return { label: 'Vence hoje', short: 'Hoje', urgency: 'today' };
  if (days === 1) return { label: 'Vence amanhã', short: 'Amanhã', urgency: 'soon' };
  return { label: date, short: numeric, urgency: 'later' };
}

export function formatFullDate(isoDate) {
  return fullDate.format(parseLocalDate(isoDate));
}

const MS_PER_MINUTE = 60_000;

const plural = (value, singular, pluralForm) => `${value} ${value === 1 ? singular : pluralForm}`;

/**
 * Tempo desde `fromMs`: `short` para o post-it ("2d 5h 12min") e `long` para leitor de tela.
 * Dias só aparecem quando existem; horas aparecem sempre que há dias, mesmo zeradas.
 */
export function formatElapsed(fromMs, nowMs) {
  const totalMinutes = Math.max(0, Math.floor((nowMs - fromMs) / MS_PER_MINUTE));
  if (totalMinutes < 1) return { short: 'agora', long: 'menos de um minuto' };

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const short = [days && `${days}d`, (days || hours) && `${hours}h`, `${minutes}min`].filter(Boolean).join(' ');
  const long = [
    days && plural(days, 'dia', 'dias'),
    (days || hours) && plural(hours, 'hora', 'horas'),
    plural(minutes, 'minuto', 'minutos'),
  ]
    .filter(Boolean)
    .join(', ');
  return { short, long };
}

export function formatDateTime(timestamp) {
  return timestamp ? dateTime.format(timestamp.toDate()) : '';
}
