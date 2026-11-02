import { describe, expect, it } from 'vitest';
import { DEFAULT_TILE_ROWS, MIN_TILE_COLS, buildLayout, changedLayouts } from './groupLayout';

describe('buildLayout', () => {
  it('mantém posições salvas e encaixa os novos abaixo delas', () => {
    const layout = buildLayout([
      { id: 'a', layout: { x: 0, y: 0, w: 6, h: 8 } },
      { id: 'b' },
      { id: 'c' },
    ]);
    expect(layout[0]).toMatchObject({ i: 'a', x: 0, y: 0, w: 6, h: 8 });
    expect(layout[1]).toMatchObject({ i: 'b', x: 0, y: 8, w: MIN_TILE_COLS, h: DEFAULT_TILE_ROWS });
    expect(layout[2]).toMatchObject({ i: 'c', x: MIN_TILE_COLS, y: 8 });
  });

  it('não altera a largura salva, para o layout não mudar sozinho entre telas', () => {
    const [item] = buildLayout([{ id: 'a', layout: { x: 9, y: 0, w: 3, h: 8 } }]);
    expect(item).toMatchObject({ x: 9, w: 3, minW: MIN_TILE_COLS });
  });
});

describe('changedLayouts', () => {
  it('retorna só o que mudou', () => {
    const groups = [
      { id: 'a', layout: { x: 0, y: 0, w: 3, h: 10 } },
      { id: 'b', layout: { x: 3, y: 0, w: 3, h: 10 } },
      { id: 'c' },
    ];
    const next = [
      { i: 'a', x: 0, y: 0, w: 3, h: 10 },
      { i: 'b', x: 3, y: 0, w: 6, h: 10 },
      { i: 'c', x: 9, y: 0, w: 3, h: 10 },
    ];
    expect(changedLayouts(next, groups)).toEqual([
      { id: 'b', layout: { x: 3, y: 0, w: 6, h: 10 } },
      { id: 'c', layout: { x: 9, y: 0, w: 3, h: 10 } },
    ]);
  });
});
