import { useId, useRef } from 'react';
import { cn } from '@/utils/cn';

const MENU_WIDTH = 216;
const ITEM_HEIGHT = 40;
const GAP = 6;

/**
 * Menu de ações sobre a Popover API: fecha com Esc e clique fora, e por estar na
 * top layer não é cortado pelas colunas roláveis do board.
 */
export function Menu({ trigger, label, items, heading, triggerClassName }) {
  const id = useId();
  const popoverRef = useRef(null);

  const place = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const height = items.length * ITEM_HEIGHT + 16;
    const fitsBelow = rect.bottom + GAP + height < window.innerHeight;
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    popoverRef.current.style.left = `${left}px`;
    popoverRef.current.style.top = `${fitsBelow ? rect.bottom + GAP : Math.max(8, rect.top - height - GAP)}px`;
  };

  const select = (item) => {
    popoverRef.current.hidePopover();
    item.onSelect();
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        popoverTarget={id}
        onClick={place}
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-ink-soft transition hover:bg-sunken hover:text-ink',
          triggerClassName,
        )}
      >
        {trigger}
      </button>
      <div
        ref={popoverRef}
        id={id}
        popover="auto"
        role="menu"
        style={{ width: MENU_WIDTH }}
        className="fixed right-auto bottom-auto m-0 rounded-xl border border-line bg-surface p-1.5 text-ink shadow-panel"
      >
        {heading && (
          <div className="mb-1 border-b border-line px-2.5 pt-1 pb-2 text-xs text-ink-soft">{heading}</div>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => select(item)}
              className={cn(
                'flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium transition hover:bg-sunken',
                item.danger && 'text-rose-700 dark:text-rose-300',
              )}
            >
              {Icon && <Icon aria-hidden className="size-4" />}
              {item.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
