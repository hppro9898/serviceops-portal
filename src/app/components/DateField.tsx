import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { DateTimePickerPopup } from './DateTimePickerPopup';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Parse a native input value ('YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm') into a local Date. */
function parseValue(v: string): Date | null {
  if (!v) return null;
  const [datePart, timePart] = v.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return null;
  let hh = 0, mm = 0;
  if (timePart) { const [h, mi] = timePart.split(':').map(Number); hh = h || 0; mm = mi || 0; }
  return new Date(y, m - 1, d, hh, mm);
}

/** Serialize a Date back to the native input string the callers expect. */
function serialize(d: Date, withTime: boolean): string {
  const base = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${base}T${pad(d.getHours())}:${pad(d.getMinutes())}` : base;
}

/** Friendly display: "03 Jul 2026" or "03 Jul 2026, 02:30 PM". */
function display(d: Date, withTime: boolean): string {
  const base = `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return base;
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${base}, ${pad(h)}:${pad(d.getMinutes())} ${ampm}`;
}

/**
 * Drop-in replacement for `<input type="date">` / `<input type="datetime-local">`.
 * Renders a styled trigger (formatted value + icon) that opens the shared
 * `DateTimePickerPopup`. `value`/`onChange` use the same string format the native
 * inputs did, so callers only swap the element.
 */
export function DateField({
  value,
  onChange,
  mode = 'date',
  className,
  placeholder = 'Select',
  min,
}: {
  value: string;
  onChange: (val: string) => void;
  mode?: 'date' | 'datetime';
  className?: string;
  placeholder?: string;
  min?: string; // accepted for API parity with the native inputs (visual only here)
}) {
  const withTime = mode === 'datetime';
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const parsed = parseValue(value);
  void min;

  const base = 'w-full flex items-center justify-between gap-2 border border-[#DFE5ED] rounded-md px-3 py-2 text-[13px] text-left bg-white hover:border-[#3D8BD0] focus:outline-none focus:border-[#3D8BD0] transition-colors';

  return (
    <>
      <button
        type="button"
        onClick={(e) => { setRect(e.currentTarget.getBoundingClientRect()); setOpen((o) => !o); }}
        className={className ? `${base} ${className}` : base}
      >
        <span className={parsed ? 'text-[#364658] truncate' : 'text-[#9CA3AF] truncate'}>
          {parsed ? display(parsed, withTime) : placeholder}
        </span>
        {withTime
          ? <Clock size={14} className="text-[#7B8FA5] flex-shrink-0" />
          : <CalendarIcon size={14} className="text-[#7B8FA5] flex-shrink-0" />}
      </button>
      {open && (
        <DateTimePickerPopup
          value={parsed || new Date()}
          mode={mode}
          anchorRect={rect}
          onApply={(d) => onChange(serialize(d, withTime))}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
