import { X } from 'lucide-react';
import type { BomScanRun } from './bomData';

/* Scan runs that happened in one gap of the version timeline. A version only appears when a scan
 * found a change, so this panel explains the scans that ran and found nothing — the thing the
 * timeline deliberately hides. */

interface BomScanRunsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  runs: BomScanRun[];
  /** Names what dismissing this returns to. Set when it is stacked on another drawer. */
}

export function BomScanRunsPanel({ isOpen, onClose, title, subtitle, runs,
}: BomScanRunsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/50">
      <div className="flex h-full w-[760px] max-w-[95vw] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="min-w-0">
              <h3 className="text-[16px] font-semibold text-[#364658]">{title}</h3>
              <p className="mt-0.5 font-mono text-[13px] text-[#7B8FA5]">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>

        {/* Runs */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <table className="w-full">
            <thead className="border-b border-[#e5e7eb]">
              <tr>
                {['Timestamp', 'Trigger', 'Duration', 'Result', 'Outcome'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#7B8FA5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {runs.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-[#f9fafb]">
                  <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#364658]">{r.timestamp}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#364658]">{r.trigger}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[13px] text-[#364658]">{r.duration}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className="inline-block rounded-sm px-2 py-0.5 text-[12px] font-medium"
                      style={r.result === 'Success'
                        ? { backgroundColor: '#ECFDF3', color: '#22A06B' }
                        : { backgroundColor: '#FEF3F2', color: '#DC2626' }}
                    >{r.result}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[13px] text-[#7B8FA5]">{r.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#DFE5ED] px-5 py-3">
          <button onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
