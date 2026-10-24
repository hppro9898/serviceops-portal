import { useState } from 'react';
import { X, ChevronDown, DollarSign } from 'lucide-react';

interface SLAHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  penaltyAmount?: number;
}

export function SLAHistoryModal({ isOpen, onClose, penaltyAmount = 0 }: SLAHistoryModalProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([]));
  if (!isOpen) return null;

  const slaHistoryData = [
    {
      name: 'P1 Critical – Response SLA', type: 'SLA', target: 'First Response', status: 'Breached',
      updatedBy: 'Darsh', elapsedTime: '1 day 21 hours 15 minutes', dueIn: '---', slaPercentage: 100, overdue: 'Yes',
      startTime: 'February 11, 2026 07:30', lastPauseTime: '---', stopTime: '---', pauseDuration: '---',
    },
    {
      name: 'P1 Critical – Resolution SLA', type: 'SLA', target: 'Resolution', status: 'Running',
      updatedBy: 'Darsh', elapsedTime: '1 day 21 hours 15 minutes', dueIn: '2 hours 45 minutes left', slaPercentage: 75, overdue: 'No',
      startTime: 'February 11, 2026 07:30', lastPauseTime: '---', stopTime: '---', pauseDuration: '---',
    },
  ];

  const toggle = (i: number) => setExpanded((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const statusStyle = (status: string) =>
    status === 'Breached' ? { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' }
    : status === 'Running' ? { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' }
    : status === 'Met' || status === 'Completed' ? { bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A' }
    : { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' };

  const barColor = (item: { status: string; slaPercentage: number }) =>
    item.status === 'Breached' || item.slaPercentage >= 100 ? '#DC2626' : item.slaPercentage >= 75 ? '#F59E0B' : '#22A06B';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[10000] transition-opacity duration-300" onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-full w-[560px] max-w-[94vw] bg-[#F8FAFC] shadow-2xl z-[10001] flex flex-col transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 bg-white border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111827]">SLA History</h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">Timeline of every SLA target on this request</p>
          </div>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          {/* Total Penalty — only shown when a penalty has been incurred */}
          {penaltyAmount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-[#EEF1F5] bg-white p-3.5 mb-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <span className="flex items-center justify-center size-10 rounded-lg flex-shrink-0" style={{ backgroundColor: '#8B5CF614' }}>
                <DollarSign size={20} style={{ color: '#8B5CF6' }} />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-[#7B8FA5]">Total Penalty</div>
                <div className="text-[20px] font-semibold leading-tight" style={{ color: '#8B5CF6' }}>${penaltyAmount.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* SLA cards */}
          <div className="space-y-3">
            {slaHistoryData.map((item, index) => {
              const ss = statusStyle(item.status);
              const isOpenCard = expanded.has(index);
              return (
                <div key={index} className="rounded-xl border border-[#EEF1F5] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#DDE3EC] transition-colors">
                  {/* Card header — key fields upfront, click to expand */}
                  <button onClick={() => toggle(index)} className="w-full text-left px-4 pt-4 pb-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-[#111827] truncate">{item.target}</span>
                          <span className="text-[10px] font-medium text-[#7B8FA5] bg-[#F3F4F6] rounded px-1.5 py-0.5 flex-shrink-0">{item.type}</span>
                        </div>
                        <div className="text-[12px] text-[#7B8FA5] mt-0.5 truncate">{item.name}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: ss.bg, color: ss.text }}>
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
                          {item.status}
                        </span>
                        <ChevronDown size={16} className={`text-[#9CA3AF] transition-transform ${isOpenCard ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#7B8FA5]">SLA consumed</span>
                        <span className="text-[12px] font-semibold" style={{ color: barColor(item) }}>{item.slaPercentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F3F6] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.slaPercentage}%`, backgroundColor: barColor(item) }} />
                      </div>
                    </div>

                    {/* Key meta — spread evenly across the full card width */}
                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Elapsed</div>
                        <div className="text-[12px] font-medium text-[#364658]">{item.elapsedTime}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Due In</div>
                        <div className="text-[12px] font-medium text-[#364658]">{item.dueIn}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">Overdue</div>
                        <div className={`text-[12px] font-semibold ${item.overdue === 'Yes' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{item.overdue}</div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded — secondary fields */}
                  {isOpenCard && (
                    <div className="px-4 pb-4 pt-3 border-t border-[#F0F1F3] grid grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { label: 'Updated By', value: item.updatedBy, link: true },
                        { label: 'Start Time', value: item.startTime },
                        { label: 'Last Pause Time', value: item.lastPauseTime },
                        { label: 'Pause Duration', value: item.pauseDuration },
                        { label: 'Stop Time', value: item.stopTime },
                        { label: 'Type', value: item.type },
                      ].map((f) => (
                        <div key={f.label} className="min-w-0">
                          <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">{f.label}</div>
                          <div className={`text-[12px] font-medium truncate ${f.link ? 'text-[#3D8BD0]' : 'text-[#364658]'}`}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
