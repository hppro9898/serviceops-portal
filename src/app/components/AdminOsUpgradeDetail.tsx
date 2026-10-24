import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowLeft, CheckCircle2, Disc, ExternalLink, Eye, FileArchive, ListChecks,
  Pause, Play, Search, Square, Trash2, UploadCloud, X,
} from 'lucide-react';
import { Pagination } from './Pagination';
import { HeaderIdPill } from './HeaderIdPill';
import { HeaderKpiRow } from './HeaderKpiRow';
import type { HeaderKpiItem } from './HeaderKpiRow';
import { UploadStatusPill, UPLOAD_TONE, jobPct } from './OsUpgradeUpload';
import type { UploadJob } from './OsUpgradeUpload';
import {
  compatCounts, computersFor, formatBytes, formatEta, prereqPhrase, prerequisitesFor,
  UPLOAD_GUIDELINES, validateIso,
} from './osUpgradeData';
import type { CompatStatus, OsImage, OsUploadStatus, PrereqKey, UploadAttempt } from './osUpgradeData';

/* OS Upgrade — detail page.
 *
 * Summary puts the image's metadata next to the prerequisites it enforces, because those two
 * answer the only question an admin has here: what is this ISO, and who can take it. Computers
 * then answers "who" concretely, evaluated from the very rules shown on the card beside it. */

interface AdminOsUpgradeDetailProps {
  image: OsImage;
  /** Live upload state — differs from image.status only while a transfer is in flight. */
  status: OsUploadStatus;
  /** Returns to the OS Upgrade grid. Leaving the module entirely is the sidebar's job. */
  onBack: () => void;
  /** In-flight transfer for this image, if any — drives the ISO card's progress state. */
  job?: UploadJob;
  /** Newest attempt, for the failure reason / who uploaded the current file. */
  latestAttempt?: UploadAttempt;
  /** Starts the transfer directly — the detail page has no upload dialog. */
  onStart: (file: File) => void;
  onHistory: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '14 Oct 2027' → Date. Parsed by hand rather than Date.parse, which is engine-dependent. */
function parseDay(s: string): Date | null {
  const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(s.trim());
  if (!m) return null;
  const month = MONTHS.indexOf(m[2]);
  return month < 0 ? null : new Date(Number(m[3]), month, Number(m[1]));
}

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

const COMPAT_TONE: Record<CompatStatus, { fg: string; bg: string }> = {
  Compatible: { fg: '#22A06B', bg: '#ECFDF3' },
  Incompatible: { fg: '#DC2626', bg: '#FEF3F2' },
  Unknown: { fg: '#64748B', bg: '#F1F5F9' },
};

/** Grid header for a prerequisite that is also a column. 'TPM Version' would wrap. */
const COL_LABEL: Partial<Record<PrereqKey, string>> = { tpm: 'TPM', disk: 'Free Disk', ram: 'RAM', secureBoot: 'Secure Boot' };

const BUCKETS: CompatStatus[] = ['Compatible', 'Incompatible', 'Unknown'];

const btnPrimary = 'inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2d6ca0]';
const btnSecondary = 'inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3.5 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]';

/* The ISO itself — one card covering every state an upload passes through.
 *
 * The picker is INLINE here, not behind a popup: on this page the card is the only thing between
 * an admin and a deployable image, so "click Upload → read a dialog → click Upload again" was two
 * steps for one intent. Dropping a file on the empty state IS the upload, and the guidelines that
 * used to live in the dialog sit beside the dropzone where they are read before choosing, not
 * after. Drives the same shared machinery, so the row, header and history still move together. */
function IsoFileCard({ image, status, job, latestAttempt, onStart, onHistory, onPause, onResume, onStop }: {
  image: OsImage;
  status: OsUploadStatus;
  job?: UploadJob;
  latestAttempt?: UploadAttempt;
  onStart: (file: File) => void;
  onHistory: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  /** Uploaded/Failed show their outcome first; this reveals the picker over it on demand. */
  const [replacing, setReplacing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const live = job && (job.status === 'uploading' || job.status === 'paused');
  const tone = UPLOAD_TONE[status];
  const pct = job ? jobPct(job) : 0;
  const hasHistory = !!latestAttempt || !!job;

  // A different record — or this one changing state — must not inherit a half-finished pick.
  useEffect(() => { setFile(null); setError(null); setDragging(false); setReplacing(false); }, [image.id, status]);

  const take = (picked?: File) => {
    if (!picked) return;
    const problem = validateIso(picked);
    setError(problem);
    setFile(problem ? null : picked);
  };

  /** Nothing on file yet → the picker IS the empty state. */
  const showPicker = !live && (replacing || status === 'Not Uploaded' || status === 'Cancelled');

  const guidelines = (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5">
      <div className="text-[12px] font-semibold text-[#364658]">Upload Guidelines</div>
      <ul className="mt-1 space-y-0.5">
        {UPLOAD_GUIDELINES.map((g) => (
          <li key={g} className="flex gap-1.5 text-[11px] leading-[1.5] text-[#64748B]">
            <span className="mt-[6px] size-1 flex-shrink-0 rounded-full bg-[#CBD5E1]" />
            {g}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <FileArchive className="size-4 flex-shrink-0 text-[#3D8BD0]" />
        <h3 className="text-[14px] font-semibold text-[#364658]">ISO File</h3>
        <UploadStatusPill status={status} />
        {hasHistory && (
          /* A named link, not an icon: "history" is not something an eye glyph says on its own,
             and this matches the page's other "View … ›" affordances. */
          <button onClick={onHistory} className="ml-auto text-[13px] font-medium text-[#3D8BD0] hover:underline">
            View upload history ›
          </button>
        )}
      </div>

      <div className="rounded-lg bg-[#F9FAFB] p-4">
        {/* ── In flight ── */}
        {live && job ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[#364658]" title={job.fileName}>{job.fileName}</div>
                <div className="mt-0.5 text-[12px] text-[#7B8FA5]">
                  {formatBytes(job.loaded)} of {formatBytes(job.fileSize)} ·{' '}
                  {job.status === 'paused' ? 'Paused' : formatEta((job.fileSize - job.loaded) / Math.max(job.rate, 1))}
                </div>
              </div>
              <span className="text-[15px] font-semibold tabular-nums text-[#364658]">{Math.round(pct)}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
              <div className="h-full rounded-full transition-[width] duration-300 ease-linear" style={{ width: `${pct}%`, backgroundColor: tone.dot }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={job.status === 'paused' ? onResume : onPause} className={btnSecondary}>
                {job.status === 'paused' ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
              </button>
              <button onClick={onStop} className="inline-flex h-8 items-center gap-1.5 rounded border border-[#FEE4E2] bg-white px-3.5 text-[13px] font-medium text-[#DC2626] transition-colors hover:bg-[#FEF3F2]">
                <Square size={13} /> Stop
              </button>
            </div>
          </>
        ) : showPicker ? (
          /* ── Pick and send, in one place ── dropzone beside the guidelines. Both panes hold the
             same min-height so choosing a file doesn't make the card jump. */
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            {file ? (
              <div className="flex min-h-[112px] flex-col justify-center rounded-lg border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 flex-shrink-0 items-center justify-center rounded bg-[#EBF5FF] text-[#3D8BD0]"><FileArchive size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-[#364658]" title={file.name}>{file.name}</div>
                    <div className="mt-0.5 text-[12px] text-[#7B8FA5]">{formatBytes(file.size)} · ready to upload</div>
                  </div>
                  <button
                    onClick={() => { setFile(null); setError(null); }}
                    title="Remove file"
                    className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#EF4444] transition-colors hover:bg-[#FEF3F2]"
                  ><Trash2 size={15} /></button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button onClick={() => onStart(file)} className={btnPrimary}><UploadCloud size={15} /> Upload ISO</button>
                  <button onClick={() => inputRef.current?.click()} className={btnSecondary}>Choose another file</button>
                  {replacing && <button onClick={() => { setFile(null); setReplacing(false); }} className={btnSecondary}>Cancel</button>}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); take(e.dataTransfer.files?.[0]); }}
                /* Horizontal, not a tall centred well: the metadata below it deserves the vertical
                   room more than the drop target does, and this still spans the full width so it
                   is an easy place to drop onto. */
                className={`flex min-h-[112px] items-center justify-center gap-3.5 rounded-lg border-2 border-dashed px-5 py-4 transition-colors ${
                  dragging ? 'border-[#3D8BD0] bg-[#F5FAFF]' : 'border-[#D6DEE8] bg-white'
                }`}
              >
                <span className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EBF5FF] text-[#3D8BD0]"><UploadCloud size={19} /></span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-[#364658]">
                    Drop your ISO here, or{' '}
                    <button onClick={() => inputRef.current?.click()} className="text-[14px] font-semibold text-[#3D8BD0] hover:underline">browse</button>
                  </div>
                  {/* The page header already names the image; repeating it here only wrapped. */}
                  <p className="mt-0.5 text-[12px] leading-[1.45] text-[#7B8FA5]">
                    {status === 'Cancelled' ? 'Last upload was stopped · ' : ''}.iso file, up to 10 GB
                  </p>
                </div>
                {replacing && (
                  <button onClick={() => setReplacing(false)} className={`${btnSecondary} ml-2 flex-shrink-0`}>Cancel</button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {error && (
                <div className="flex items-start gap-2 rounded border border-[#FEE4E2] bg-[#FFFBFA] px-3 py-2 text-[12px] text-[#DC2626]">
                  <AlertCircle size={14} className="mt-px flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {guidelines}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".iso"
              className="hidden"
              onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }}
            />
          </div>
        ) : status === 'Uploaded' ? (
          /* ── Landed ── */
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 flex-shrink-0 items-center justify-center rounded bg-[#ECFDF3] text-[#22A06B]"><CheckCircle2 size={18} /></span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[#364658]" title={image.fileName}>{image.fileName}</div>
                <div className="mt-0.5 text-[12px] text-[#7B8FA5]">
                  {image.size} · uploaded {image.uploadTime}{latestAttempt ? ` by ${latestAttempt.by}` : ''}
                </div>
              </div>
            </div>
            <button onClick={() => setReplacing(true)} className={btnSecondary}><UploadCloud size={15} /> Replace ISO</button>
          </div>
        ) : (
          /* ── Failed ── the reason is the point; the retry sits next to it */
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 flex-shrink-0 items-center justify-center rounded bg-[#FEF3F2] text-[#DC2626]"><AlertCircle size={18} /></span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[#364658]" title={latestAttempt?.fileName ?? image.fileName}>
                  {latestAttempt?.fileName ?? image.fileName ?? 'Last upload failed'}
                </div>
                <div className="mt-0.5 text-[12px] text-[#DC2626]">{latestAttempt?.detail ?? 'The last attempt did not complete.'}</div>
              </div>
            </div>
            <button onClick={() => setReplacing(true)} className={btnPrimary}><UploadCloud size={15} /> Retry upload</button>
          </div>
        )}
      </div>
    </section>
  );
}

export function AdminOsUpgradeDetail({ image, status, onBack, job, latestAttempt, onStart, onHistory, onPause, onResume, onStop }: AdminOsUpgradeDetailProps) {
  const [tab, setTab] = useState<'summary' | 'computers'>('summary');
  const [bucket, setBucket] = useState<CompatStatus>('Compatible');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // The fleet is derived from the image id — memoised so scrolling doesn't rebuild 160 rows.
  const prereqs = useMemo(() => prerequisitesFor(image), [image]);
  const fleet = useMemo(() => computersFor(image), [image]);
  const counts = useMemo(() => compatCounts(fleet), [fleet]);
  const columns = prereqs.filter((p) => p.column);

  const q = search.trim().toLowerCase();
  const rows = fleet
    .filter((c) => c.status === bucket)
    .filter((c) => !q || [c.hostName, c.ipAddress, c.currentOs, c.reasons.join(' ')].some((f) => f.toLowerCase().includes(q)));

  useEffect(() => { setPage(1); }, [bucket, search, image.id]);
  useEffect(() => { setTab('summary'); setBucket('Compatible'); setSearch(''); }, [image.id]);

  const totalPages = Math.ceil(rows.length / perPage) || 1;
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);

  const eos = parseDay(image.eosDate);
  const eosPast = !!eos && eos.getTime() < Date.now();
  const tone = UPLOAD_TONE[status];

  const cellValue = (c: (typeof fleet)[number], key: PrereqKey) => {
    switch (key) {
      case 'ram': return c.ram === null ? <Dash /> : `${c.ram} GB`;
      case 'disk': return c.disk === null ? <Dash /> : `${c.disk} GB`;
      case 'tpm': return c.tpm === null ? <Dash /> : c.tpm.toFixed(1);
      case 'secureBoot': return c.secureBoot === null ? <Dash /> : c.secureBoot ? 'Enabled' : 'Disabled';
      case 'cpuSpeed': return c.cpuSpeed === null ? <Dash /> : `${c.cpuSpeed.toFixed(1)} GHz`;
      case 'cpuCores': return c.cpuCores === null ? <Dash /> : String(c.cpuCores);
      case 'arch': return c.arch ?? <Dash />;
      default: return <Dash />;
    }
  };

  const meta: [string, React.ReactNode][] = [
    ['OS Name', image.title],
    ['Platform', image.platform],
    ['Edition', image.edition],
    ['Architecture', image.architecture],
    ['OS Version', image.osVersion],
    ['Language', image.language],
    ['Size', image.size],
    ['Upload Status', <UploadStatusPill key="s" status={status} />],
    ['Upload Time', image.uploadTime || <Dash />],
    ['End-of-Support Date', (
      <span key="eos" className={eosPast ? 'text-[#DC2626]' : undefined}>
        {image.eosDate}{eosPast && ' · expired'}
      </span>
    )],
    ['ISO File Name', image.fileName || <Dash />],
    ['Reference URL', (
      <a key="ref" href={image.referenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#3D8BD0] hover:underline">
        {image.referenceLabel} <ExternalLink size={12} />
      </a>
    )],
  ];

  /* Header KPIs — the same chip vocabulary every detail drawer uses, fed through the shared
     HeaderKpiRow so the strip collapses into a "+N" pill instead of wrapping. */
  const kpis: HeaderKpiItem[] = [
    { key: 'platform', tip: `Platform: ${image.platform}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Platform</span>
        <span className="text-[12px] font-medium text-[#364658]">{image.platform}</span>
      </span>
    ) },
    { key: 'arch', tip: `Architecture: ${image.architecture}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Architecture</span>
        <span className="text-[12px] font-medium text-[#364658]">{image.architecture}</span>
      </span>
    ) },
    { key: 'lang', tip: `Language: ${image.language}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Language</span>
        <span className="text-[12px] font-medium text-[#364658]">{image.language}</span>
      </span>
    ) },
    { key: 'size', tip: `Size: ${image.size}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Size</span>
        <span className="text-[12px] font-medium text-[#364658]">{image.size}</span>
      </span>
    ) },
    { key: 'upload', tip: `Upload: ${status}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Upload</span>
        <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} />
        <span className="text-[12px] font-medium" style={{ color: tone.fg }}>{status}</span>
      </span>
    ) },
    { key: 'eos', tip: `End of support: ${image.eosDate}${eosPast ? ' (expired)' : ''}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">EOS</span>
        {eosPast && <span className="size-2 flex-shrink-0 rounded-full bg-[#EF4444]" />}
        <span className="text-[12px] font-medium" style={{ color: eosPast ? '#DC2626' : '#364658' }}>{image.eosDate}</span>
      </span>
    ) },
  ];

  return (
    <div>
      {/* ── Header band ── the back arrow is its own column, so the title and the KPI strip beside
          it share one left edge; putting it inside the h1 would indent the title away from the
          strip below. The sidebar nav covers the rest of the trail, so no breadcrumb. */}
      <div className="border-b border-[#e5e7eb] px-4 pb-3 pt-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            title="Back to OS Upgrade"
            className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#64748B] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"
          ><ArrowLeft size={18} /></button>

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 truncate text-[18px] font-semibold text-[#364658]">
              <HeaderIdPill id={image.id} />
              <span className="truncate">{image.title}</span>
            </h1>
            <HeaderKpiRow items={kpis} />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-[#e5e7eb] px-4">
        <div className="flex items-center gap-2.5">
          {([['summary', 'Summary'], ['computers', 'Computers']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`whitespace-nowrap border-b-2 px-2 py-3 text-[14px] font-medium transition-colors ${
                tab === id ? 'border-[#3D8BD0] text-[#3D8BD0]' : 'border-transparent text-[#6b7280] hover:border-[#CBD5E1] hover:text-[#364658]'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
      {tab === 'summary' && (
        /* space-y-5: the three sections are sized to clear the fold together on a laptop —
           an admin should see the file, what it is, and who can take it without scrolling. */
        <div className="space-y-4">
          {/* ISO file leads: until one lands the image cannot be deployed, so it is the first
              thing to answer — and on a fresh record it is the only action available. */}
          <IsoFileCard
            image={image}
            status={status}
            job={job}
            latestAttempt={latestAttempt}
            onStart={onStart}
            onHistory={onHistory}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
          />

          {/* Metadata — the asset Hardware tab's container: section head, then a grey panel of
              label-over-value pairs. Full width, so the grid runs 4-up like that tab does. */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Disc className="size-4 flex-shrink-0 text-[#3D8BD0]" />
              <h3 className="text-[14px] font-semibold text-[#364658]">OS Image Details</h3>
            </div>
            {/* Spacing is the asset Hardware tab's verbatim: p-5 panel, gap-x-6 gap-y-5 grid. */}
            <div className="rounded-lg bg-[#F9FAFB] p-5">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {meta.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <div className="mb-1 text-[12px] text-[#64748B]">{label}</div>
                    <div className="break-words text-[13px] font-medium text-[#364658]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Prerequisites — same metadata panel as the card above, so the two read as one
              language; the comparison the values imply is stated once underneath. */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="size-4 flex-shrink-0 text-[#3D8BD0]" />
              <h3 className="text-[14px] font-semibold text-[#364658]">Prerequisites</h3>
              <span className="ml-auto text-[12px] text-[#7B8FA5]">{prereqs.length} rules · all must pass</span>
            </div>
            {/* Spacing is the asset Hardware tab's verbatim: p-5 panel, gap-x-6 gap-y-5 grid. */}
            <div className="rounded-lg bg-[#F9FAFB] p-5">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {prereqs.map((p) => {
                  // The rule read as a sentence — emphasis on the number, the comparison muted
                  // around it, so the row says what it means without operator syntax.
                  const ph = prereqPhrase(p);
                  return (
                    <div key={p.key} className="min-w-0">
                      <div className="mb-1 text-[12px] text-[#64748B]">{p.attribute}</div>
                      <div className="break-words text-[13px] text-[#64748B]">
                        {ph.lead && <>{ph.lead} </>}
                        <span className="font-semibold text-[#364658]">{ph.value}</span>
                        {ph.qualifier && <> {ph.qualifier}</>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[12px] text-[#7B8FA5]">
                An endpoint must meet or exceed every value above before this upgrade is offered to it.
              </p>
              <span className="ml-auto text-[12px] text-[#7B8FA5]">
                Evaluated against <span className="font-semibold text-[#364658]">{fleet.length}</span> endpoints ·{' '}
                <span className="font-semibold text-[#22A06B]">{counts.Compatible} eligible</span>
              </span>
              <button onClick={() => setTab('computers')} className="text-[12px] font-medium text-[#3D8BD0] hover:underline">View computers ›</button>
            </div>
          </section>
        </div>
      )}

      {tab === 'computers' && (
        /* Full-bleed, no card — same listing chrome as the module's own grid. */
        <div>
          <div>
            {/* Sub-tabs with counts — the patch detail page's bucket pills */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {BUCKETS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBucket(b)}
                  className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    bucket === b ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]' : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
                  }`}
                >
                  {b}
                  <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
                    bucket === b ? 'bg-[#3D8BD0] text-white' : 'bg-[#EEF2F6] text-[#64748B]'
                  }`}>{counts[b]}</span>
                </button>
              ))}
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Select field to search..."
                className="h-8 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
              />
              {search ? (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-y border-[#e5e7eb]">
                <tr>
                  {['Host Name', 'IP Address', 'Current OS'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">{h}</th>
                  ))}
                  {/* Columns follow the prerequisites, so every reason below has a visible value */}
                  {columns.map((p) => (
                    <th key={p.key} className="whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">{COL_LABEL[p.key] ?? p.attribute}</th>
                  ))}
                  {['Status', 'Reasons'].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5 + columns.length} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                      No {bucket.toLowerCase()} endpoints{q ? ` match “${search}”` : ''}.
                    </td>
                  </tr>
                ) : pageRows.map((c) => (
                  <tr key={c.hostName} className="transition-colors hover:bg-[#f9fafb]">
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-[#364658]">{c.hostName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-[#364658]">{c.ipAddress}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">
                      {c.currentOs === 'Unknown' ? <span className="text-[#9CA3AF]">Unknown</span> : c.currentOs}
                    </td>
                    {columns.map((p) => (
                      <td key={p.key} className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">{cellValue(c, p.key)}</td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ color: COMPAT_TONE[c.status].fg, backgroundColor: COMPAT_TONE[c.status].bg }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#DC2626]">
                      {c.reasons.length ? c.reasons.join('; ') : <Dash />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            itemsPerPage={perPage}
            totalItems={rows.length}
            onPageChange={setPage}
            onItemsPerPageChange={(v) => { setPerPage(v); setPage(1); }}
          />
        </div>
      )}
      </div>
    </div>
  );
}
