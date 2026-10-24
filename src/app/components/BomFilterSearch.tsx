import { useRef, useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

/* The BOM component search: pick a field, pick an operator, pick a value — and every choice you
 * make becomes a chip you can remove. One control instead of a select per column.
 *
 * It lives here because BOTH the component list and the version comparison need it, and the
 * alternative was a plain text box on one of them plus a list of ecosystems in a filter menu on
 * the other. That is two ways to answer "show me only the Maven packages", which is one too many
 * — and the two would have drifted the first time either changed.
 */

export type Operator = 'is' | 'is not' | 'contains' | 'does not contain';
export const OPERATORS: Operator[] = ['is', 'is not', 'contains', 'does not contain'];
/** is / is not pick from the column's real values; contains takes free text. */
export const isListOperator = (op: Operator) => op === 'is' || op === 'is not';

export interface Condition { field: string; op: Operator; value: string }

export const matches = (cellValue: string, c: Condition): boolean => {
  const a = (cellValue ?? '').toLowerCase();
  const b = c.value.toLowerCase();
  switch (c.op) {
    case 'is': return a === b;
    case 'is not': return a !== b;
    case 'contains': return a.includes(b);
    case 'does not contain': return !a.includes(b);
  }
};

/** Does a row pass every condition? The row is read through `valueOf` so each screen can keep
 *  its own shape — the matching itself is the same on both. */
export const passesConditions = <T,>(
  row: T, conditions: Condition[], valueOf: (row: T, field: string) => string,
) => conditions.every((c) => matches(valueOf(row, c.field), c));

interface FilterSearchProps {
  /** Fields offered, in menu order. */
  fields: string[];
  /** The real values a field takes, for the is / is not pickers. */
  valuesFor: (field: string) => string[];
  conditions: Condition[];
  onChange: (next: Condition[]) => void;
  placeholder?: string;
}

export function BomFilterSearch({
  fields, valuesFor, conditions, onChange, placeholder = 'Select field to search...',
}: FilterSearchProps) {
  const [builder, setBuilder] = useState<{ field?: string; op?: Operator } | null>(null);
  const [valueQuery, setValueQuery] = useState('');
  const valueInputRef = useRef<HTMLInputElement>(null);

  const addCondition = (value: string) => {
    if (!builder?.field || !builder.op || !value.trim()) return;
    onChange([...conditions, { field: builder.field, op: builder.op, value: value.trim() }]);
    setBuilder(null); setValueQuery('');
  };

  return (
    <div className="relative flex-1">
      <div
        onClick={() => { if (!builder) setBuilder({}); }}
        className={`flex min-h-8 w-full cursor-text flex-wrap items-center gap-1.5 rounded border bg-white px-2.5 py-1 transition-colors ${
          builder ? 'border-[#3D8BD0] ring-1 ring-[#3D8BD0]' : 'border-[#d1d5db]'
        }`}
      >
        {conditions.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-sm bg-[#EBF5FF] px-1.5 py-0.5 text-[12px] text-[#3D8BD0]">
            <span className="font-medium">{c.field}</span>
            <span className="text-[#7B8FA5]">{c.op}</span>
            <span className="font-medium">{c.value}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(conditions.filter((_, j) => j !== i)); }}
              className="text-[#3D8BD0]/70 hover:text-[#DC2626]"
            ><X size={12} /></button>
          </span>
        ))}
        {conditions.length === 0 && !builder && (
          <span className="text-[13px] text-[#9ca3af]">{placeholder}</span>
        )}
        {builder && (
          <span className="inline-flex items-center gap-1 text-[13px] text-[#364658]">
            {builder.field && <span className="font-medium">{builder.field}</span>}
            {builder.field && <ChevronRight size={13} className="text-[#9CA3AF]" />}
            {builder.op && <span className="text-[#7B8FA5]">{builder.op}</span>}
            {builder.op && <ChevronRight size={13} className="text-[#9CA3AF]" />}
          </span>
        )}
        <Search className="ml-auto flex-shrink-0 text-[#9ca3af]" size={16} />
      </div>

      {/* Three-step popup: field → operator → value */}
      {builder && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setBuilder(null); setValueQuery(''); }} />
          <div className="absolute left-0 top-full z-50 mt-1 w-[320px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
            {!builder.field && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Filter by field</div>
                <div className="max-h-[300px] overflow-y-auto">
                  {fields.map((f) => (
                    <button
                      key={f}
                      onClick={() => setBuilder({ field: f })}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F9FAFB]"
                    >
                      {f}<ChevronRight size={14} className="text-[#9CA3AF]" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {builder.field && !builder.op && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Operator</div>
                {OPERATORS.map((op) => (
                  <button
                    key={op}
                    onClick={() => { setBuilder({ ...builder, op }); setValueQuery(''); setTimeout(() => valueInputRef.current?.focus(), 0); }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F9FAFB]"
                  >
                    {op}<ChevronRight size={14} className="text-[#9CA3AF]" />
                  </button>
                ))}
              </>
            )}

            {builder.field && builder.op && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Value</div>
                <div className="px-3 pb-2">
                  <input
                    ref={valueInputRef}
                    type="text"
                    value={valueQuery}
                    onChange={(e) => setValueQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCondition(valueQuery); }}
                    placeholder={isListOperator(builder.op) ? 'Search values...' : 'Type a value, then Enter'}
                    className="h-8 w-full rounded border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[13px] text-[#364658] placeholder:text-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3D8BD0]"
                  />
                </div>
                {isListOperator(builder.op) && (
                  <div className="max-h-[240px] overflow-y-auto">
                    {valuesFor(builder.field)
                      .filter((v) => !valueQuery.trim() || v.toLowerCase().includes(valueQuery.trim().toLowerCase()))
                      .map((v) => (
                        <button
                          key={v}
                          onClick={() => addCondition(v)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F9FAFB]"
                        >
                          <span className="truncate">{v}</span>
                        </button>
                      ))}
                    {valuesFor(builder.field).filter((v) => !valueQuery.trim() || v.toLowerCase().includes(valueQuery.trim().toLowerCase())).length === 0 && (
                      <div className="px-3 py-3 text-center text-[13px] text-[#9CA3AF]">No matching values</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
