import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import {
  X, Paperclip, Trash2, UploadCloud, Pause, Play, Square, CheckCircle2, AlertCircle,
  ChevronDown, RotateCcw,
} from 'lucide-react';
import { formatBytes, formatEta, UPLOAD_GUIDELINES, validateIso } from './osUpgradeData';
import type { OsImage, OsUploadStatus } from './osUpgradeData';

/* The ISO uploader — the popup, and the dock it minimises into.
 *
 * A 5 GB ISO takes minutes, so the transfer must survive the admin closing the popup and carrying
 * on with other rows. The dock is therefore the source of truth for anything in flight; the popup
 * is just a bigger view of one job. */

export type JobStatus = 'uploading' | 'paused' | 'done' | 'failed';

export interface UploadJob {
  jobId: string;
  imageId: string;
  /** Shown under the file name in the dock, so a minimised upload still says what it is for. */
  imageName: string;
  file: File;
  fileName: string;
  fileSize: number;
  loaded: number;
  status: JobStatus;
  error?: string;
  /** Simulated bytes per second. */
  rate: number;
  /** Fraction at which this transfer is scripted to fail — see startJob(). */
  failAt?: number;
}

export const jobPct = (j: UploadJob) => (j.fileSize ? Math.min(100, (j.loaded / j.fileSize) * 100) : 0);

/** One colour per upload state, shared by the listing column, the detail header and the activity
 *  panel — so the same state never renders two different ways. */
export const UPLOAD_TONE: Record<OsUploadStatus, { fg: string; bg: string; dot: string }> = {
  'Uploaded': { fg: '#22A06B', bg: '#ECFDF3', dot: '#22C55E' },
  'In Progress': { fg: '#3D8BD0', bg: '#EBF5FF', dot: '#3D8BD0' },
  'Paused': { fg: '#B45309', bg: '#FFFAEB', dot: '#F59E0B' },
  'Failed': { fg: '#DC2626', bg: '#FEF3F2', dot: '#EF4444' },
  'Cancelled': { fg: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' },
  'Not Uploaded': { fg: '#64748B', bg: '#F1F5F9', dot: '#CBD5E1' },
};

export function UploadStatusPill({ status }: { status: OsUploadStatus }) {
  const t = UPLOAD_TONE[status];
  return (
    <span className="inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ color: t.fg, backgroundColor: t.bg }}>
      {status}
    </span>
  );
}

const btnSecondary = 'inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]';
const btnPrimary = 'inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]';
const iconBtn = 'flex size-8 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]';

function ProgressBar({ pct, tone }: { pct: number; tone: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EEF2F6]">
      <div className="h-full rounded-full transition-[width] duration-300 ease-linear" style={{ width: `${pct}%`, backgroundColor: tone }} />
    </div>
  );
}

/** File name + size chip — the same row the popup and the dock both need. */
function FileChip({ name, size, onRemove }: { name: string; size: string; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-2.5 rounded border border-[#E5E7EB] bg-white px-3 py-2.5">
      <span className="flex size-8 flex-shrink-0 items-center justify-center rounded bg-[#EBF5FF] text-[#3D8BD0]"><Paperclip size={15} /></span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[#364658]" title={name}>{name}</div>
        <div className="text-[12px] text-[#7B8FA5]">{size}</div>
      </div>
      {onRemove && (
        <button onClick={onRemove} title="Remove file" className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#EF4444] transition-colors hover:bg-[#FEF3F2]">
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

// ── Upload ISO popup ───────────────────────────────────────────────────────

interface UploadIsoModalProps {
  image: OsImage;
  /** The transfer for this image, if one is already running. */
  job?: UploadJob;
  onClose: () => void;
  onMinimize: () => void;
  onStart: (file: File) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry: () => void;
  /** Throws the failed transfer away so the popup returns to the file picker. */
  onDiscard: () => void;
}

export function UploadIsoModal({ image, job, onClose, onMinimize, onStart, onPause, onResume, onStop, onRetry, onDiscard }: UploadIsoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = job && (job.status === 'uploading' || job.status === 'paused');
  const pct = job ? jobPct(job) : 0;

  const take = (picked: File | undefined) => {
    if (!picked) return;
    const problem = validateIso(picked);
    setError(problem);
    setFile(problem ? null : picked);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    take(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-full w-[620px] max-w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header — minimise then close, the same order and glyphs as the detail drawers */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-[#364658]">Upload ISO</h3>
            <p className="mt-0.5 truncate text-[12px] text-[#7B8FA5]">{image.id} · {image.title}</p>
          </div>
          <div className="flex flex-shrink-0 items-center">
            {job && (
              <button onClick={onMinimize} title="Minimize — the upload keeps running" className={iconBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
              </button>
            )}
            <button onClick={onClose} title={active ? 'Close — the upload keeps running' : 'Close'} className={iconBtn}><X size={18} /></button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-1.5 text-[13px] font-medium text-[#364658]">Upload File <span className="text-[#DC2626]">*</span></div>

          {/* 1 — nothing in flight: pick a file */}
          {!job && !file && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded border border-dashed px-4 py-7 transition-colors ${
                dragging ? 'border-[#3D8BD0] bg-[#F5FAFF]' : 'border-[#CBD5E1] bg-[#F9FAFB]'
              }`}
            >
              <UploadCloud size={22} className="text-[#9CA3AF]" />
              <div className="text-[13px] text-[#64748B]">Choose files (or) Drop here</div>
              <button onClick={() => inputRef.current?.click()} className={btnSecondary}>Browse</button>
              <input ref={inputRef} type="file" accept=".iso" className="hidden" onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
          )}

          {/* 2 — a file is chosen but not sent yet */}
          {!job && file && <FileChip name={file.name} size={formatBytes(file.size)} onRemove={() => { setFile(null); setError(null); }} />}

          {error && (
            <div className="mt-2 flex items-start gap-2 rounded border border-[#FEE4E2] bg-[#FFFBFA] px-3 py-2 text-[12px] text-[#DC2626]">
              <AlertCircle size={14} className="mt-px flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 3 — in flight, paused, done or failed */}
          {job && (
            <div className="rounded border border-[#E5E7EB] bg-white px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <span className={`flex size-8 flex-shrink-0 items-center justify-center rounded ${
                  job.status === 'done' ? 'bg-[#ECFDF3] text-[#22A06B]' : job.status === 'failed' ? 'bg-[#FEF3F2] text-[#DC2626]' : 'bg-[#EBF5FF] text-[#3D8BD0]'
                }`}>
                  {job.status === 'done' ? <CheckCircle2 size={16} /> : job.status === 'failed' ? <AlertCircle size={16} /> : <Paperclip size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[#364658]" title={job.fileName}>{job.fileName}</div>
                  <div className="text-[12px] text-[#7B8FA5]">
                    {job.status === 'done'
                      ? `${formatBytes(job.fileSize)} · upload complete`
                      : job.status === 'failed'
                        ? `${formatBytes(job.loaded)} of ${formatBytes(job.fileSize)} transferred`
                        : `${formatBytes(job.loaded)} of ${formatBytes(job.fileSize)} · ${job.status === 'paused' ? 'Paused' : formatEta((job.fileSize - job.loaded) / Math.max(job.rate, 1))}`}
                  </div>
                </div>
                <span className={`flex-shrink-0 text-[13px] font-semibold tabular-nums ${
                  job.status === 'failed' ? 'text-[#DC2626]' : job.status === 'done' ? 'text-[#22A06B]' : 'text-[#364658]'
                }`}>{Math.round(pct)}%</span>
              </div>

              <div className="mt-2.5">
                <ProgressBar pct={pct} tone={job.status === 'failed' ? '#EF4444' : job.status === 'done' ? '#22C55E' : job.status === 'paused' ? '#F59E0B' : '#3D8BD0'} />
              </div>

              {job.status === 'failed' && job.error && (
                <div className="mt-2.5 flex items-start gap-2 rounded border border-[#FEE4E2] bg-[#FFFBFA] px-3 py-2 text-[12px] text-[#DC2626]">
                  <AlertCircle size={14} className="mt-px flex-shrink-0" />
                  <span>{job.error}</span>
                </div>
              )}

              {/* Transfer controls — pause/resume and stop, the reason this popup can be left alone */}
              <div className="mt-3 flex items-center gap-2">
                {active && (
                  <>
                    <button onClick={job.status === 'paused' ? onResume : onPause} className={btnSecondary}>
                      {job.status === 'paused' ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
                    </button>
                    <button onClick={onStop} className="inline-flex h-8 items-center gap-1.5 rounded border border-[#FEE4E2] bg-white px-3 text-[13px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF3F2]">
                      <Square size={13} /> Stop
                    </button>
                    <span className="ml-auto text-[12px] text-[#7B8FA5]">Minimize to keep working while this finishes</span>
                  </>
                )}
                {job.status === 'failed' && (
                  <>
                    <button onClick={onRetry} className={btnPrimary}><RotateCcw size={14} /> Retry upload</button>
                    <button onClick={onDiscard} className={btnSecondary}>Choose another file</button>
                  </>
                )}
                {job.status === 'done' && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-[#22A06B]"><CheckCircle2 size={15} /> {image.id} is ready to deploy</span>
                )}
              </div>
            </div>
          )}

          {/* Primary action — only before the transfer starts; afterwards the controls above own it */}
          {!job && (
            <div className="mt-3 flex justify-end">
              <button disabled={!file} onClick={() => file && onStart(file)} className={btnPrimary}><UploadCloud size={15} /> Upload</button>
            </div>
          )}
          {job?.status === 'done' && (
            <div className="mt-3 flex justify-end">
              <button onClick={onClose} className={btnPrimary}>Done</button>
            </div>
          )}

          <div className="mt-5">
            <div className="text-[14px] font-semibold text-[#364658]">Upload Guidelines</div>
            <ul className="mt-2 space-y-1.5">
              {UPLOAD_GUIDELINES.map((g) => (
                <li key={g} className="flex gap-2 text-[13px] leading-[1.5] text-[#64748B]">
                  <span className="mt-[7px] size-1 flex-shrink-0 rounded-full bg-[#CBD5E1]" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Minimised dock ─────────────────────────────────────────────────────────

interface UploadDockProps {
  jobs: UploadJob[];
  onOpen: (job: UploadJob) => void;
  onPause: (job: UploadJob) => void;
  onResume: (job: UploadJob) => void;
  onStop: (job: UploadJob) => void;
  onRetry: (job: UploadJob) => void;
  onDismiss: (job: UploadJob) => void;
  /** Clears every finished row; the dock disappears once nothing is left. */
  onClearFinished: () => void;
}

export function UploadDock({ jobs, onOpen, onPause, onResume, onStop, onRetry, onDismiss, onClearFinished }: UploadDockProps) {
  const [collapsed, setCollapsed] = useState(false);
  if (!jobs.length) return null;

  const active = jobs.filter((j) => j.status === 'uploading' || j.status === 'paused');
  const failed = jobs.filter((j) => j.status === 'failed');
  const done = jobs.filter((j) => j.status === 'done');
  const title = active.length
    ? `Uploading ${active.length} file${active.length === 1 ? '' : 's'}`
    : failed.length
      ? `${failed.length} upload${failed.length === 1 ? '' : 's'} failed`
      : `${done.length} upload${done.length === 1 ? '' : 's'} complete`;

  const dockIcon = 'flex size-7 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]';

  return (
    <div className="fixed bottom-4 right-4 z-[10000] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-[#DFE5ED] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.16)]">
      <div className="flex items-center gap-2 border-b border-[#F0F2F5] bg-[#F9FAFB] px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#364658]">{title}</span>
        {failed.length > 0 && active.length > 0 && (
          <span className="flex-shrink-0 rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 text-[11px] font-medium text-[#DC2626]">{failed.length} failed</span>
        )}
        <button onClick={() => setCollapsed((v) => !v)} title={collapsed ? 'Expand' : 'Collapse'} className={dockIcon}>
          <ChevronDown size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
        <button onClick={onClearFinished} title="Clear finished" className={dockIcon}><X size={16} /></button>
      </div>

      {!collapsed && (
        <div className="max-h-[320px] overflow-y-auto">
          {jobs.map((j) => {
            const pct = jobPct(j);
            return (
              <div key={j.jobId} className="border-b border-[#F0F2F5] px-3.5 py-2.5 last:border-b-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => onOpen(j)} className="min-w-0 flex-1 text-left">
                    <div className="truncate text-[12px] font-medium text-[#364658] hover:text-[#3D8BD0]" title={j.fileName}>{j.fileName}</div>
                    <div className="truncate text-[11px] text-[#7B8FA5]">{j.imageId} · {j.imageName}</div>
                  </button>
                  <span className={`flex-shrink-0 text-[12px] font-semibold tabular-nums ${
                    j.status === 'failed' ? 'text-[#DC2626]' : j.status === 'done' ? 'text-[#22A06B]' : 'text-[#64748B]'
                  }`}>
                    {j.status === 'done' ? <CheckCircle2 size={15} /> : j.status === 'failed' ? <AlertCircle size={15} /> : `${Math.round(pct)}%`}
                  </span>
                </div>

                {j.status !== 'done' && (
                  <div className="mt-2">
                    <ProgressBar pct={pct} tone={j.status === 'failed' ? '#EF4444' : j.status === 'paused' ? '#F59E0B' : '#3D8BD0'} />
                  </div>
                )}

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[11px] text-[#7B8FA5]">
                    {j.status === 'done' && 'Uploaded'}
                    {j.status === 'failed' && (j.error ?? 'Upload failed')}
                    {j.status === 'paused' && `Paused · ${formatBytes(j.loaded)} of ${formatBytes(j.fileSize)}`}
                    {j.status === 'uploading' && `${formatBytes(j.loaded)} of ${formatBytes(j.fileSize)} · ${formatEta((j.fileSize - j.loaded) / Math.max(j.rate, 1))}`}
                  </span>
                  <div className="flex flex-shrink-0 items-center gap-0.5">
                    {(j.status === 'uploading' || j.status === 'paused') && (
                      <>
                        <button onClick={() => (j.status === 'paused' ? onResume(j) : onPause(j))} title={j.status === 'paused' ? 'Resume' : 'Pause'} className={dockIcon}>
                          {j.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                        <button onClick={() => onStop(j)} title="Stop upload" className="flex size-7 items-center justify-center rounded text-[#EF4444] transition-colors hover:bg-[#FEF3F2]"><Square size={13} /></button>
                      </>
                    )}
                    {j.status === 'failed' && (
                      <>
                        <button onClick={() => onRetry(j)} title="Retry" className={dockIcon}><RotateCcw size={14} /></button>
                        <button onClick={() => onDismiss(j)} title="Dismiss" className={dockIcon}><X size={14} /></button>
                      </>
                    )}
                    {j.status === 'done' && (
                      <button onClick={() => onDismiss(j)} title="Dismiss" className={dockIcon}><X size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
