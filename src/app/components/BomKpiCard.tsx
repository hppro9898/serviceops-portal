import { useState } from 'react';
import { ArrowRight, Info, X } from 'lucide-react';

/* THE KPI CARD GRAMMAR — the one shape every BOM KPI card takes.
 *
 *   line 1   [icon] Title ....................................... [Action →]
 *   line 2   [BIG NUMBER] [chip] [inline visual] [muted context]
 *
 * It lives in this component rather than in each page's markup, because the last time it did not
 * the dashboard's cards and the register's cards drifted to different heights within a day. A new
 * card is an instance of this; a deviation needs a stated reason.
 *
 * The rules that are easy to lose, and why they are here rather than in a doc:
 *
 * - The action is revealed on hover AND on focus-within. A hover-only control is invisible to
 *   anyone tabbing through, and a card whose only affordance cannot be reached by keyboard is a
 *   card with no affordance for those readers.
 * - On a touch device there is no hover, so `@media (hover: none)` pins the action visible. This
 *   is the one case where the reveal is not a nicety but a total loss of the control.
 * - Line 2 never wraps. Everything on it is `flex-shrink-0` EXCEPT the muted context, which owns
 *   the remaining width and truncates — so the first thing to go when space runs out is the
 *   lowest-priority thing, and the number and chip are never the ones cut.
 * - Colour is for exceptions. A number takes a semantic colour only when the metric itself IS the
 *   exception; otherwise it is primary text, and the chip carries the tint.
 */

/** Line-2 pieces are typed so a caller cannot invent a fourth kind of thing to put on the row. */
export type KpiTone = 'danger' | 'warn' | 'ok' | 'neutral';

const TONE: Record<KpiTone, { text: string; bg: string; num: string }> = {
  danger: { text: '#B42318', bg: '#FEF3F2', num: '#B42318' },
  warn: { text: '#B54708', bg: '#FEF7E6', num: '#D97706' },
  ok: { text: '#22A06B', bg: '#ECFDF3', num: '#22A06B' },
  neutral: { text: '#64748B', bg: '#F1F5F9', num: '#364658' },
};

/** What the figure MEANS, beside the heading rather than under the number — a definition is read
 *  once and should not hold a line of the card for the rest of its life. */
function InfoTip({ text }: { text: string }) {
  const [on, setOn] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={text}
        onMouseEnter={() => setOn(true)}
        onMouseLeave={() => setOn(false)}
        onFocus={() => setOn(true)}
        onBlur={() => setOn(false)}
        className="inline-flex cursor-help text-[#B6C2CF] transition-colors hover:text-[#3D8BD0]"
      ><Info size={13} /></button>
      {on && (
        <span className="absolute left-1/2 top-full z-30 mt-1.5 w-[210px] -translate-x-1/2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] leading-relaxed text-[#364658] shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

/** The big number, with the denominator grammar. "13" means nothing; "13 of 847" does. */
export function KpiValue({ value, of, tone = 'neutral' }: {
  value: number | string;
  /** Rendered as a muted "of N" suffix — the denominator, not a second figure. */
  of?: number | string;
  /** `danger`/`warn` only when the metric ITSELF is the exception. */
  tone?: KpiTone;
}) {
  return (
    <span className="flex flex-shrink-0 items-baseline gap-1.5">
      <span
        className="text-[24px] font-bold leading-none tracking-[-0.6px] tabular-nums"
        style={{ color: TONE[tone].num }}
      >{typeof value === 'number' ? value.toLocaleString() : value}</span>
      {of !== undefined && (
        <span className="text-[13px] font-medium text-[#7B8FA5]">of {typeof of === 'number' ? of.toLocaleString() : of}</span>
      )}
    </span>
  );
}

/** At most ONE per card: the single most important qualifier of the number beside it. */
export function KpiChip({ tone = 'neutral', children }: { tone?: KpiTone; children: React.ReactNode }) {
  const t = TONE[tone];
  return (
    <span
      className="inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: t.bg, color: t.text }}
    >{children}</span>
  );
}

/** At most ONE per card, and only when it carries real distribution data. A strip with nothing to
 *  be a proportion OF measures nothing — that is why the components card has none. */
export function KpiSplit({ segments, label }: {
  segments: { key: string; n: number; color: string }[];
  /** Spoken form of the same distribution: the strip is colour-only otherwise. */
  label: string;
}) {
  const live = segments.filter((s) => s.n > 0);
  const total = live.reduce((n, s) => n + s.n, 0) || 1;
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="flex h-[7px] w-[76px] flex-shrink-0 gap-0.5 overflow-hidden rounded-full bg-[#F1F5F9]"
    >
      {live.map((s) => (
        <span key={s.key} className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${(s.n / total) * 100}%`, backgroundColor: s.color }} />
      ))}
    </span>
  );
}

/** Lowest priority on the row — it owns the leftover width and is the first thing to be cut. */
export function KpiContext({ children }: { children: React.ReactNode }) {
  return <span className="min-w-0 flex-1 truncate text-[11.5px] text-[#7B8FA5]">{children}</span>;
}

export interface KpiAction {
  label: string;
  onClick: () => void;
  /** A filtering card's action is a toggle: it says what it is doing while it is doing it. */
  active?: boolean;
  activeLabel?: string;
}

export function BomKpiCard({ icon, title, info, action, children }: {
  icon: React.ReactNode;
  title: string;
  info?: string;
  action?: KpiAction;
  /** Line 2. Compose from KpiValue / KpiChip / KpiSplit / KpiContext, in that order. */
  children: React.ReactNode;
}) {
  const on = !!action?.active;
  return (
    <article
      /* `group` so the action keys off the CARD's hover rather than its own — the whole card is
         the target, which is what makes the reveal read as the card waking up. */
      className="group flex min-h-[90px] min-w-0 flex-col justify-center gap-2 rounded-xl border-[0.5px] border-[#E5E7EB] bg-white px-4 py-3.5 transition-all duration-150 hover:border-[#3D8BD0] hover:shadow-sm focus-within:border-[#3D8BD0] focus-within:shadow-sm"
    >
      {/* Line 1 — what this is, and the one thing you can do about it. */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex-shrink-0 text-[#7B8FA5]">{icon}</span>
          <span className="truncate text-[13px] font-medium text-[#7B8FA5]">{title}</span>
          {info && <InfoTip text={info} />}
        </span>
        {action && (
          <button
            onClick={action.onClick}
            aria-pressed={action.activeLabel !== undefined ? on : undefined}
            /* Revealed on hover, on focus-within, and ALWAYS on a device with no hover — plus
               whenever it is the one filtering, since an active filter with no visible control is
               a page that has changed for no reason the reader can see. */
            className={`-mr-1 inline-flex flex-shrink-0 translate-x-1 items-center gap-1 rounded px-1 py-0.5 text-[12px] font-medium text-[#3D8BD0] opacity-0 transition-all duration-150 hover:bg-[#F5FAFF] focus-visible:translate-x-0 focus-visible:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100 ${
              on ? 'translate-x-0 opacity-100' : ''
            }`}
          >
            {on
              ? <>{action.activeLabel ?? 'Showing this'} <X size={13} /></>
              : <>{action.label} <ArrowRight size={13} /></>}
          </button>
        )}
      </div>

      {/* Line 2 — one row, never two. */}
      <div className="flex min-w-0 items-center gap-[9px]">{children}</div>
    </article>
  );
}
