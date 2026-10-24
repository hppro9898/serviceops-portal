import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/* The ONE dropdown pattern the BOM screens share (UI review, Oct 2026): a keyboard-operable menu,
 * a checkmark on the selected option, right-aligned muted counts, an optional sub-line per
 * option, and options that can be disabled WITH a reason — so a combination that can only return
 * an empty table is never offered as a choice. Used by the Affected tab toolbar and the BOM tab's
 * application picker. */

export interface DropOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Plain text for the button and for the tooltip when the label is a node. */
  text?: string;
  sub?: React.ReactNode;
  count?: number;
  disabled?: boolean;
  /** Shown under a disabled option. */
  reason?: string;
}

export function BomDropdown<T extends string>({ value, options, onChange, prefix, icon, buttonNode, width = 'auto', menuWidth = 260, title, ariaLabel }: {
  value: T;
  options: DropOption<T>[];
  onChange: (v: T) => void;
  /** Muted word before the value — e.g. "View:". */
  prefix?: string;
  icon?: React.ReactNode;
  /** Replaces the default button content (the selected option's label). */
  buttonNode?: React.ReactNode;
  width?: string;
  menuWidth?: number;
  title?: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const cur = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  useEffect(() => { if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value))); }, [open]);

  const move = (dir: 1 | -1) => {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) { setActive(i); return; }
    }
  };
  const pick = (o: DropOption<T>) => { if (o.disabled) return; onChange(o.value); setOpen(false); btnRef.current?.focus(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(options[active]); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); }
  };

  return (
    <div className="relative min-w-0" ref={ref} onKeyDown={onKey}>
      <button ref={btnRef} type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel}
        title={title ?? cur?.text}
        style={{ width }}
        className="inline-flex h-9 max-w-full items-center gap-2 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] text-[#364658] transition-colors hover:border-[#3D8BD0] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]">
        {icon && <span className="flex-shrink-0 text-[#7B8FA5]">{icon}</span>}
        {prefix && <span className="flex-shrink-0 text-[#7B8FA5]">{prefix}</span>}
        <span className="min-w-0 flex-1 truncate text-left font-medium">{buttonNode ?? cur?.label}</span>
        <ChevronDown size={14} className={`flex-shrink-0 text-[#7B8FA5] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" aria-label={ariaLabel} style={{ width: menuWidth }}
          className="absolute left-0 top-full z-50 mt-1 max-h-[340px] overflow-y-auto rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
          {options.map((o, i) => {
            const sel = o.value === value;
            return (
              <div key={o.value} role="option" aria-selected={sel} aria-disabled={o.disabled || undefined}
                onMouseEnter={() => !o.disabled && setActive(i)} onClick={() => pick(o)}
                className={`flex items-start gap-2 px-3 py-2 text-[13px] ${o.disabled ? 'cursor-not-allowed text-[#9CA3AF]'
                  : `cursor-pointer text-[#364658] ${i === active ? 'bg-[#F5F7FA]' : ''}`}`}>
                <span className="mt-[3px] flex w-4 flex-shrink-0 justify-center">{sel && <Check size={14} className="text-[#3D8BD0]" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{o.label}</span>
                  {o.sub && <span className="mt-0.5 block truncate text-[11px] text-[#7B8FA5]">{o.sub}</span>}
                  {o.disabled && o.reason && <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">{o.reason}</span>}
                </span>
                {o.count !== undefined && <span className="mt-px flex-shrink-0 text-[12px] tabular-nums text-[#9CA3AF]">{o.count}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
