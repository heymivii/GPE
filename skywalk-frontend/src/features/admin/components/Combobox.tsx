import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Max rows rendered at once (the full list can be tens of thousands). */
  maxResults?: number;
  id?: string;
}

/**
 * Free-text searchable combobox. The input text is both the value and the
 * search query (admins may type a city absent from the geo source). Filtering
 * is a case-insensitive substring match, capped at `maxResults` rendered rows.
 */
export default function Combobox({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  maxResults = 50,
  id,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { results, total } = useMemo(() => {
    const q = value.trim().toLowerCase();
    const matched = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return { results: matched.slice(0, maxResults), total: matched.length };
  }, [options, value, maxResults]);

  // Reset the highlight whenever the result set or open state changes.
  useEffect(() => setHighlight(0), [value, open]);

  // Close when clicking outside the component.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Keep the highlighted row in view during keyboard navigation.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        else setHighlight((h) => Math.min(h + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
        if (open && results[highlight]) {
          e.preventDefault();
          select(results[highlight]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        type="text"
        required={required}
        disabled={disabled}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 pr-9 border border-gray-200 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-sm text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      <ChevronDown
        className={`absolute right-3 top-[1.15rem] -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
      />

      {open && !disabled && results.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1"
        >
          {results.map((option, i) => (
            <li
              key={option}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              // mousedown + preventDefault: select before the input's blur fires.
              onMouseDown={(e) => {
                e.preventDefault();
                select(option);
              }}
              className={`px-3.5 py-2 text-sm cursor-pointer ${
                i === highlight ? 'bg-brand-ink text-white' : 'text-gray-700'
              }`}
            >
              {option}
            </li>
          ))}
          {total > results.length && (
            <li className="px-3.5 py-2 text-xs text-gray-500 italic border-t border-gray-100">
              {total - results.length} autres… affine ta recherche
            </li>
          )}
        </ul>
      )}

      {open && !disabled && value.trim() !== '' && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3.5 py-2 text-sm text-gray-500 italic">
          Aucune correspondance — « {value.trim()} » sera créée telle quelle.
        </div>
      )}
    </div>
  );
}
