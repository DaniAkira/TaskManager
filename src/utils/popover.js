const GAP = 6;
const EDGE = 8;

/** Posiciona um popover `fixed` junto ao gatilho, virando para cima quando falta espaço embaixo. */
export function placePopover(popover, anchor, { width, height, align = 'end' }) {
  const rect = anchor.getBoundingClientRect();
  const preferred = align === 'end' ? rect.right - width : rect.left;
  const left = Math.max(EDGE, Math.min(preferred, window.innerWidth - width - EDGE));
  const fitsBelow = rect.bottom + GAP + height < window.innerHeight;
  popover.style.left = `${left}px`;
  popover.style.top = `${fitsBelow ? rect.bottom + GAP : Math.max(EDGE, rect.top - height - GAP)}px`;
}
