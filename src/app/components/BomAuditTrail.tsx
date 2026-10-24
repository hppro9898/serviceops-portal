import { Clock } from 'lucide-react';
import { auditFor, useProductsVersion } from './bomProductsData';
import type { ProductRecord, AuditEntry } from './bomProductsData';

/* Application — Audit Trail tab.
 *
 * What happened to this entry, newest first and grouped by day: added to BOM scope, details
 * edited (each field as old → new), linked or unlinked in the CMDB, a new SBOM uploaded, a scan
 * requested. Read from the store's audit log, which every change writes to — so the trail, the
 * Last Updated time on BOM Scope and the record itself can never disagree. */

const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const AVATAR = ['#3D8BD0', '#7E3AC2', '#22A06B', '#D97706', '#DB2777'];
const tone = (n: string) => AVATAR[[...n].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATAR.length];
const dayOf = (at: string) => { const d = new Date(at); return isNaN(d.getTime()) ? at : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }); };
const timeOf = (at: string) => { const d = new Date(at); return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); };

export function BomAuditTrail({ p }: { p: ProductRecord }) {
  useProductsVersion();
  const rows = [...auditFor(p.id)].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const days: [string, AuditEntry[]][] = [];
  rows.forEach((r) => { const k = dayOf(r.at); const g = days.find(([d]) => d === k); g ? g[1].push(r) : days.push([k, [r]]); });

  if (!rows.length) return <p className="px-6 py-10 text-center text-[13px] text-[#9CA3AF]">No activity recorded yet.</p>;
  return (
    <div className="px-6 py-5">
      {days.map(([day, list]) => (
        <section key={day} className="mb-6 last:mb-0">
          <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#7B8FA5]">{day}</h4>
          <ol className="relative ml-[15px] border-l border-[#E5E7EB]">
            {list.map((r, i) => (
              <li key={i} className="relative pb-5 pl-6 last:pb-1">
                <span className="absolute -left-[15px] top-0 flex size-[30px] items-center justify-center rounded-full text-[11px] font-semibold text-white ring-4 ring-white"
                  style={{ backgroundColor: tone(r.by) }}>{initials(r.by)}</span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                  <span className="text-[13px] font-semibold text-[#364658]">{r.by}</span>
                  <span className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[12px] text-[#475467]">{r.action}</span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-[#7B8FA5]"><Clock size={12} />{timeOf(r.at)}</span>
                </div>
                {r.detail && <p className="mt-1 text-[12px] text-[#64748B]">{r.detail}</p>}
                {r.changes?.length ? (
                  <div className="mt-1.5 space-y-1">
                    {r.changes.map((c) => (
                      <div key={c.field} className="flex flex-wrap items-center gap-1.5 text-[12px]">
                        <span className="text-[#7B8FA5]">{c.field}</span>
                        <span className="rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 text-[#B42318] line-through decoration-[#B42318]/40">{c.from}</span>
                        <span className="text-[#9CA3AF]">→</span>
                        <span className="rounded-sm bg-[#ECFDF3] px-1.5 py-0.5 text-[#22A06B]">{c.to}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
