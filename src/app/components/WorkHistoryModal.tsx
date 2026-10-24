import { X, Edit, Trash2 } from 'lucide-react';

export interface WorkLog {
  id: string;
  technician: { name: string; initials: string; color: string };
  /** datetime-local string, e.g. "2026-06-01T19:33" */
  start: string;
  end: string;
  description: string;
  /** Optional override; computed from start/end when omitted. */
  timeTaken?: string;
}

interface WorkHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WorkLog[];
  onDelete: (id: string) => void;
  onEdit: (log: WorkLog) => void;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => String(n).padStart(2, '0');

function formatDateTime(v: string): string {
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${DAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`;
}

function computeDuration(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return '—';
  const secs = Math.round((e - s) / 1000);
  if (secs < 60) return `${secs} second${secs !== 1 ? 's' : ''}`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (days % 7 === 0 || weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  const months = Math.round(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

export function WorkHistoryModal({ isOpen, onClose, logs, onDelete, onEdit }: WorkHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[10001]" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[1000px] max-w-[96vw] bg-white shadow-2xl z-[10002] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h2 className="text-[18px] font-semibold text-[#111827]">Work History</h2>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]">
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {logs.length === 0 ? (
            <div className="text-[13px] text-[#9CA3AF] py-12 text-center">No work logs added yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-3 pr-4 text-[13px] font-semibold text-[#6B7280] whitespace-nowrap">Technician</th>
                  <th className="pb-3 pr-4 text-[13px] font-semibold text-[#6B7280] whitespace-nowrap">Start Date</th>
                  <th className="pb-3 pr-4 text-[13px] font-semibold text-[#6B7280] whitespace-nowrap">End Date</th>
                  <th className="pb-3 pr-4 text-[13px] font-semibold text-[#6B7280] whitespace-nowrap">Time Taken</th>
                  <th className="pb-3 pr-4 text-[13px] font-semibold text-[#6B7280] whitespace-nowrap">Description</th>
                  <th className="pb-3 pl-4 text-[13px] font-semibold text-[#6B7280] whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-6 rounded flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                          style={{ backgroundColor: log.technician.color }}
                        >
                          {log.technician.initials}
                        </span>
                        <span className="text-[13px] text-[#364658]">{log.technician.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-[#364658] whitespace-nowrap">{formatDateTime(log.start)}</td>
                    <td className="py-3 pr-4 text-[13px] text-[#364658] whitespace-nowrap">{formatDateTime(log.end)}</td>
                    <td className="py-3 pr-4 text-[13px] text-[#364658] whitespace-nowrap">
                      {log.timeTaken || computeDuration(log.start, log.end)}
                    </td>
                    <td className="py-3 pr-4 text-[13px] text-[#364658]">{log.description || '—'}</td>
                    <td className="py-3 pl-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => onEdit(log)}
                          className="text-[#7B8FA5] hover:text-[#3D8BD0] transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          className="text-[#E74C3C] hover:text-[#C0392B] transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
