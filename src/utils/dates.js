// O prazo é uma data de calendário (YYYY-MM-DD), sem hora: guardar como Timestamp
// faria o dia mudar para quem está em outro fuso horário.
const MS_PER_DAY = 86_400_000;
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
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
  if (days < 0) return { label: `Atrasada · ${date}`, urgency: 'overdue' };
  if (days === 0) return { label: 'Vence hoje', urgency: 'today' };
  if (days === 1) return { label: 'Vence amanhã', urgency: 'soon' };
  return { label: date, urgency: 'later' };
}

export function formatFullDate(isoDate) {
  return fullDate.format(parseLocalDate(isoDate));
}

export function formatDateTime(timestamp) {
  return timestamp ? dateTime.format(timestamp.toDate()) : '';
}
