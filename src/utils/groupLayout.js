// Grade dos grupos no desktop. Posições ficam em unidades da grade, não em pixels,
// para o mesmo layout servir a telas de larguras diferentes.
export const GRID = { cols: 12, rowHeight: 32, margin: 14 };

// Limites em colunas, e não em pixels: um mínimo derivado da largura da tela mudaria
// com a barra de rolagem e acabaria gravado no layout de todos os grupos.
export const MIN_TILE_COLS = 3;
export const DEFAULT_TILE_ROWS = 10;
export const MIN_TILE_ROWS = 5;

const LIMITS = { minW: MIN_TILE_COLS, minH: MIN_TILE_ROWS };

/** Grupos sem posição salva entram depois dos já posicionados, lado a lado. */
export function buildLayout(groups) {
  const perRow = Math.floor(GRID.cols / MIN_TILE_COLS);
  const placed = groups.filter((group) => group.layout);
  const placedBottom = Math.max(0, ...placed.map(({ layout }) => layout.y + layout.h));
  let pending = 0;

  return groups.map((group) => {
    if (group.layout) return { i: group.id, ...group.layout, ...LIMITS };
    const index = pending++;
    return {
      i: group.id,
      x: (index % perRow) * MIN_TILE_COLS,
      y: placedBottom + Math.floor(index / perRow) * DEFAULT_TILE_ROWS,
      w: MIN_TILE_COLS,
      h: DEFAULT_TILE_ROWS,
      ...LIMITS,
    };
  });
}

/** Só os grupos cuja posição mudou: a compactação pode mover vários de uma vez. */
export function changedLayouts(layout, groups) {
  const stored = Object.fromEntries(groups.map((group) => [group.id, group.layout]));
  return layout
    .filter(({ i, x, y, w, h }) => {
      const current = stored[i];
      return !current || current.x !== x || current.y !== y || current.w !== w || current.h !== h;
    })
    .map(({ i, x, y, w, h }) => ({ id: i, layout: { x, y, w, h } }));
}
