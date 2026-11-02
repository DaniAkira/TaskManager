import { useCallback, useMemo, useState } from 'react';
import ReactGridLayout, { useContainerWidth, verticalCompactor } from 'react-grid-layout';
import { GRID, buildLayout, changedLayouts } from '@/utils/groupLayout';

const GRID_CONFIG = {
  cols: GRID.cols,
  rowHeight: GRID.rowHeight,
  margin: [GRID.margin, GRID.margin],
  containerPadding: [0, 0],
};

// O arraste do bloco só começa pelo cabeçalho, e nunca pelos botões dele.
const DRAG_HANDLE = '.group-drag-handle';
const DRAG_CANCEL = 'button, a, input, select, [popover]';
const RESIZE_HANDLES = ['e', 's', 'se'];

/** Grupos como blocos de dashboard: arrastar pelo cabeçalho, redimensionar pelas bordas. */
export function GroupGrid({ groups, canEdit, onLayoutCommit, renderGroup }) {
  const { width, containerRef, mounted } = useContainerWidth();
  const layout = useMemo(() => buildLayout(groups), [groups]);

  // O conteúdo dos grupos (com todos os post-its) só é recriado quando os grupos mudam.
  const contents = useMemo(
    () => new Map(groups.map((group) => [group.id, renderGroup(group)])),
    [groups, renderGroup],
  );

  // Na v2 do react-grid-layout, o item arrastado guarda a posição em pixels numa ref e só
  // redesenha quando muda de célula: sem isso, ele anda aos trancos atrás do mouse.
  // Cada movimento gera invólucros novos, o que redesenha os itens sem tocar no conteúdo.
  const [, setFrame] = useState(0);
  const repaint = useCallback(() => setFrame((frame) => frame + 1), []);

  const commit = (nextLayout) => {
    const changes = changedLayouts(nextLayout, groups);
    if (changes.length > 0) onLayoutCommit(changes);
  };

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          width={width}
          layout={layout}
          gridConfig={GRID_CONFIG}
          dragConfig={{ enabled: canEdit, handle: DRAG_HANDLE, cancel: DRAG_CANCEL }}
          resizeConfig={{ enabled: canEdit, handles: RESIZE_HANDLES }}
          compactor={verticalCompactor}
          onDrag={repaint}
          onResize={repaint}
          onDragStop={commit}
          onResizeStop={commit}
        >
          {groups.map((group) => (
            <div key={group.id}>{contents.get(group.id)}</div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
