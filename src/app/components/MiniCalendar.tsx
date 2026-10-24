import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface CalendarEvent {
  /** datetime-local string, e.g. "2026-06-16T14:00" */
  start: string;
  id: string;
  /** schedule group name, e.g. "Change Schedule", "Planned Rollout", "Down Time", or a custom group name */
  group?: string;
  /** description text the user entered for this schedule in the planning tab */
  description?: string;
  /** @deprecated kept for backward compatibility — use `group` / `description` */
  title?: string;
  /** short context label, e.g. "Scheduled start" */
  label?: string;
  /** accent color for the bar / dot */
  color?: string;
}

interface MiniCalendarProps {
  /** Schedule entries for the change currently open. */
  events?: CalendarEvent[];
  /** Header title (e.g. "Change Calendar" or "Release Calendar"). */
  title?: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pad = (n: number) => String(n).padStart(2, '0');
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function formatTime(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${pad(h)}:${pad(d.getMinutes())} ${ampm}`;
}

export function MiniCalendar({ events = [], title = 'Change Calendar' }: MiniCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(keyOf(today));
  const [expanded, setExpanded] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const selectDay = (k: string) => { setSelected(k); setShowAllEvents(false); };

  const todayKey = keyOf(today);

  // Group the current change's schedule entries by day.
  const byDate: Record<string, CalendarEvent[]> = {};
  events.forEach((ev) => {
    if (!ev.start) return;
    const d = new Date(ev.start);
    if (isNaN(d.getTime())) return;
    const k = keyOf(d);
    (byDate[k] ||= []).push(ev);
  });

  // Build a 6×7 grid starting on Monday.
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Mon = 0
  const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const goMonth = (delta: number) => {
    const m = viewMonth + delta;
    const ny = viewYear + Math.floor(m / 12);
    const nm = ((m % 12) + 12) % 12;
    setViewYear(ny);
    setViewMonth(nm);
  };

  const selectedDate = new Date(`${selected}T00:00:00`);
  const selectedEvents = byDate[selected] ?? [];
  const selectedLabel = `${DAY_NAMES[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  return (
    <div className="border border-[#DFE5ED] rounded-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#364658]" />
          <h3 className="text-[13px] font-semibold text-[#364658]">{title}</h3>
        </div>
        <button className="text-[#7B8FA5] hover:text-[#364658] transition-colors">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold text-[#364658]">
              {MONTHS[viewMonth]} {viewYear}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goMonth(-1)}
                className="size-7 flex items-center justify-center rounded text-[#7B8FA5] hover:bg-[#F1F5F9] hover:text-[#364658] transition-colors"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => goMonth(1)}
                className="size-7 flex items-center justify-center rounded text-[#7B8FA5] hover:bg-[#F1F5F9] hover:text-[#364658] transition-colors"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[11px] font-medium text-[#8E8E93] py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Day grid — iOS-style: circular today/selected, event dot below */}
          <div className="grid grid-cols-7 gap-y-2">
            {cells.map((d) => {
              const k = keyOf(d);
              const inMonth = d.getMonth() === viewMonth;
              const isSelected = k === selected;
              const isToday = k === todayKey;
              const dayEvents = byDate[k];
              const hasEvents = !!dayEvents;

              let circle = 'flex items-center justify-center size-8 rounded-full text-[13px] transition-colors ';
              if (isSelected) {
                circle += 'bg-[#3D8BD0] text-white font-semibold ';
              } else if (hasEvents) {
                // Scheduled day — soft blue highlight + dot below
                circle += 'bg-[#EBF5FF] text-[#3D8BD0] font-semibold hover:bg-[#DCEAFB] ';
              } else if (isToday) {
                circle += 'text-[#3D8BD0] font-semibold group-hover:bg-[#EBF5FF] ';
              } else if (!inMonth) {
                circle += 'text-[#C5CDD8] group-hover:bg-[#F2F2F7] ';
              } else {
                circle += 'text-[#1C1C1E] group-hover:bg-[#F2F2F7] ';
              }

              return (
                <button
                  key={k}
                  onClick={() => selectDay(k)}
                  className="group flex flex-col items-center gap-0.5 cursor-pointer"
                  title={hasEvents ? `${dayEvents.length} schedule entr${dayEvents.length > 1 ? 'ies' : 'y'}` : undefined}
                >
                  <span className={circle}>{d.getDate()}</span>
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: hasEvents ? (dayEvents[0].color || '#3D8BD0') : 'transparent' }}
                  />
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          <div className="mt-3 pt-3 border-t border-[#EEF1F5]">
            <div className="text-[13px] font-semibold text-[#364658] mb-2">{selectedLabel}</div>
            {selectedEvents.length === 0 ? (
              <div className="text-[12px] text-[#9CA3AF] py-1">No changes scheduled</div>
            ) : (
              <div className="space-y-1.5">
                {(showAllEvents ? selectedEvents : selectedEvents.slice(0, 2)).map((ev, idx) => (
                  <div
                    key={`${ev.id}-${idx}`}
                    className="flex items-start gap-2 p-2 rounded-md border border-[#EEF1F5] bg-[#FAFBFC]"
                  >
                    <span className="mt-0.5 w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#3D8BD0' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#3D8BD0]">{ev.group || ev.id}</span>
                        <span className="text-[11px] text-[#7B8FA5] flex-shrink-0">
                          {ev.label ? `${ev.label} · ` : ''}{formatTime(ev.start)}
                        </span>
                      </div>
                      {ev.description || ev.title ? (
                        <div
                          className="text-[12px] text-[#364658]"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {ev.description || ev.title}
                        </div>
                      ) : (
                        <div className="text-[12px] text-[#9CA3AF] italic">No description added</div>
                      )}
                    </div>
                  </div>
                ))}

                {selectedEvents.length > 2 && (
                  <button
                    onClick={() => setShowAllEvents((s) => !s)}
                    className="mt-1 text-[13px] text-[#3D8BD0] hover:text-[#2563EB] font-medium flex items-center gap-1 transition-colors"
                  >
                    {showAllEvents ? (
                      <>Show less <ChevronUp size={14} /></>
                    ) : (
                      <>View {selectedEvents.length - 2} more schedule{selectedEvents.length - 2 > 1 ? 's' : ''} <ChevronDown size={14} /></>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
