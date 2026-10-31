import { Check, Pipette } from 'lucide-react';
import { GROUP_COLORS } from '@/constants/colors';
import { cn } from '@/utils/cn';

export function ColorPicker({ value, onChange }) {
  const isCustom = !GROUP_COLORS.some((color) => color.value === value);
  return (
    <div role="radiogroup" aria-label="Cor do grupo" className="flex flex-wrap gap-2">
      {GROUP_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          role="radio"
          aria-checked={value === color.value}
          aria-label={color.label}
          title={color.label}
          onClick={() => onChange(color.value)}
          style={{ backgroundColor: color.value }}
          className={cn(
            'flex size-9 items-center justify-center rounded-md text-black/70 transition hover:-translate-y-0.5',
            value === color.value && 'ring-2 ring-ink ring-offset-2 ring-offset-surface',
          )}
        >
          {value === color.value && <Check aria-hidden className="size-4" />}
        </button>
      ))}
      <label
        title="Cor personalizada"
        style={isCustom ? { backgroundColor: value } : undefined}
        className={cn(
          'relative flex size-9 cursor-pointer items-center justify-center rounded-md border border-dashed border-ink-faint text-ink-soft transition hover:-translate-y-0.5',
          isCustom && 'border-0 text-black/70 ring-2 ring-ink ring-offset-2 ring-offset-surface',
        )}
      >
        <Pipette aria-hidden className="size-4" />
        <span className="sr-only">Cor personalizada</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
