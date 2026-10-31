import { describe, expect, it } from 'vitest';
import { ORDER_STEP, orderBetween, planMove } from './ordering';

const byId = (tasks) => Object.fromEntries(tasks.map((t) => [t.id, t]));

describe('orderBetween', () => {
  it('coloca antes do primeiro e depois do último', () => {
    expect(orderBetween(null, 5000)).toBe(5000 - ORDER_STEP);
    expect(orderBetween(5000, null)).toBe(5000 + ORDER_STEP);
  });

  it('usa o ponto médio entre vizinhos', () => {
    expect(orderBetween(100, 200)).toBe(150);
  });

  it('retorna null quando os vizinhos estão colados', () => {
    expect(orderBetween(100, 100.0001)).toBeNull();
  });
});

describe('planMove', () => {
  const tasks = [
    { id: 'a', groupId: 'g1', order: 100 },
    { id: 'b', groupId: 'g1', order: 200 },
    { id: 'c', groupId: 'g1', order: 300 },
  ];

  it('não grava nada se a tarefa não mudou de lugar', () => {
    const moves = planMove({
      taskId: 'b',
      groupId: 'g1',
      orderedIds: ['a', 'b', 'c'],
      tasksById: byId(tasks),
    });
    expect(moves).toEqual([]);
  });

  it('grava um único documento em um reorder normal', () => {
    const moves = planMove({
      taskId: 'c',
      groupId: 'g1',
      orderedIds: ['a', 'c', 'b'],
      tasksById: byId(tasks),
    });
    expect(moves).toEqual([{ id: 'c', groupId: 'g1', order: 150 }]);
  });

  it('muda de grupo mesmo que a ordem numérica já sirva', () => {
    const moves = planMove({
      taskId: 'a',
      groupId: 'g2',
      orderedIds: ['a'],
      tasksById: byId(tasks),
    });
    expect(moves).toHaveLength(1);
    expect(moves[0]).toMatchObject({ id: 'a', groupId: 'g2' });
  });

  it('reindexa a coluna quando acaba a precisão', () => {
    const tight = [
      { id: 'a', groupId: 'g1', order: 100 },
      { id: 'b', groupId: 'g1', order: 100.0001 },
      { id: 'c', groupId: 'g1', order: 300 },
    ];
    const moves = planMove({
      taskId: 'c',
      groupId: 'g1',
      orderedIds: ['a', 'c', 'b'],
      tasksById: byId(tight),
    });
    expect(moves.map((m) => m.id)).toEqual(['a', 'c', 'b']);
    expect(moves[0].order).toBeLessThan(moves[1].order);
    expect(moves[1].order).toBeLessThan(moves[2].order);
  });
});
