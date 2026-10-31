import { describe, expect, it } from 'vitest';
import { daysUntil, describeDueDate } from './dates';

const NOW = new Date(2026, 9, 30, 23, 30);

describe('daysUntil', () => {
  it('compara dias de calendário, ignorando a hora atual', () => {
    expect(daysUntil('2026-10-30', NOW)).toBe(0);
    expect(daysUntil('2026-10-31', NOW)).toBe(1);
    expect(daysUntil('2026-10-29', NOW)).toBe(-1);
  });
});

describe('describeDueDate', () => {
  it('classifica a urgência', () => {
    expect(describeDueDate('2026-10-20', NOW).urgency).toBe('overdue');
    expect(describeDueDate('2026-10-30', NOW).urgency).toBe('today');
    expect(describeDueDate('2026-10-31', NOW).urgency).toBe('soon');
    expect(describeDueDate('2026-12-25', NOW).urgency).toBe('later');
  });
});
