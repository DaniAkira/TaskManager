import { describe, expect, it } from 'vitest';
import { daysUntil, describeDueDate, formatElapsed } from './dates';

const NOW = new Date(2026, 9, 30, 23, 30);

describe('daysUntil', () => {
  it('compara dias de calendário, ignorando a hora atual', () => {
    expect(daysUntil('2026-10-30', NOW)).toBe(0);
    expect(daysUntil('2026-10-31', NOW)).toBe(1);
    expect(daysUntil('2026-10-29', NOW)).toBe(-1);
  });
});

describe('formatElapsed', () => {
  const minute = 60_000;
  const at = (minutes) => formatElapsed(0, minutes * minute);

  it('mostra minutos, horas e dias conforme o tempo passa', () => {
    expect(at(0).short).toBe('agora');
    expect(at(12).short).toBe('12min');
    expect(at(5 * 60 + 12).short).toBe('5h 12min');
    expect(at(2 * 1440 + 5 * 60 + 12).short).toBe('2d 5h 12min');
  });

  it('mantém as horas quando há dias, mesmo zeradas', () => {
    expect(at(1440 + 3).short).toBe('1d 0h 3min');
    expect(at(60).short).toBe('1h 0min');
  });

  it('descreve por extenso para leitor de tela', () => {
    expect(at(1440 + 60 + 1).long).toBe('1 dia, 1 hora, 1 minuto');
    expect(at(2 * 1440 + 2 * 60 + 2).long).toBe('2 dias, 2 horas, 2 minutos');
  });

  it('não fica negativo com relógio do aparelho adiantado no servidor', () => {
    expect(formatElapsed(10 * minute, 0).short).toBe('agora');
  });
});

describe('describeDueDate', () => {
  it('classifica a urgência', () => {
    expect(describeDueDate('2026-10-20', NOW).urgency).toBe('overdue');
    expect(describeDueDate('2026-10-30', NOW).urgency).toBe('today');
    expect(describeDueDate('2026-10-31', NOW).urgency).toBe('soon');
    expect(describeDueDate('2026-12-25', NOW).urgency).toBe('later');
  });

  it('tem forma curta numérica para o rodapé do post-it', () => {
    expect(describeDueDate('2026-12-25', NOW).short).toBe('25/12');
    expect(describeDueDate('2026-10-20', NOW).short).toBe('20/10');
    expect(describeDueDate('2026-10-30', NOW).short).toBe('Hoje');
  });
});
